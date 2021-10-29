const InsuranceNFT = require('./src/abis/InsuranceNFT.json');
const Verify = require('./src/abis/Verify.json');
const InsuranceDAO = require('./src/abis/InsuranceDAO.json');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const Web3 = require('web3');
const pinataSDK = require('@pinata/sdk');
const ethWallet = require('ethereumjs-wallet');
const { ethers } = require("ethers");
const fs = require('fs');
const { ApolloClient, HttpLink, DefaultOptions, InMemoryCache } = require('@apollo/client/core');
const fetch = require('cross-fetch');
const gql = require('graphql-tag');
const protobuf = require("protobufjs");
const pinata = pinataSDK(process.env.PERSONAL_PINATA_PUBLIC_KEY, process.env.PERSONAL_PINATA_SECRET_KEY);
const projectID = process.env.PROJECT_ID;
const app = express(); 
const testNet = process.env.TEST_NET;
const signingKey = process.env.PRIVATE_KEY;

const upload = multer({dest: 'uploads/'})

let web3;
let chainId;

//swap between Kovan and Iotex testnets
if(testNet=="KOVAN"){
  web3 = new Web3(new Web3.providers.HttpProvider(`https://kovan.infura.io/v3/${projectID}`));
  chainId = 42;
  }
else{
  web3 = new Web3(new Web3.providers.HttpProvider(`https://babel-api.testnet.iotex.io`));
  chainId = 4690;
  }

const port = process.env.SERVER_PORT || 6000;

//instances of all 3 contracts
const NFTInstance = new web3.eth.Contract(InsuranceNFT.abi, InsuranceNFT.networks[chainId].address);
const VerifyInstance = new web3.eth.Contract(Verify.abi, Verify.networks[chainId].address);
const DAOInstance = new web3.eth.Contract(InsuranceDAO.abi, InsuranceDAO.networks[chainId].address);

app.use(cors());

app.listen(port, () => console.log(`Listening on port ${port}`));
  
app.get('/nft-store/:address', async (req, res) => {
    const address = req.params.address;
    console.log(address);
    object = await dataFetch(address, true) 

  res.send({success : address, results : object}); 
});

//initial check called in useEffect to see if address has registered device
app.get('/init-device-check/:address', async (req, res) => {
  const address = req.params.address;
  object = await dataFetch(address.toLowerCase(), true)
  if (object.length===0){
    console.log('no devices')
    return res.send({IMEI : ""})
  }
  else{
    const deviceIMEI = object[0].id;
    return res.send({IMEI : deviceIMEI})
  }
});

//used to render all NFTs for profile
app.get('/user-nfts/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address);
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  const start = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
  let tokenURIs = [tokenIds.length];
  if(tokenIds.length==0){
    res.send({success: false, results : [], start : 0})
  }
  else{
    
    for (var i =0; i<tokenIds.length; i++){
      tokenURIs[i] =  await NFTInstance.methods.tokenURI(tokenIds[i]).call();
    }
    
    res.send({success : true, results : tokenURIs, start : start});
  }
 
});

//main mint call
app.get('/mint/:address', async (req, res) => {
  //process query params
  const address = req.params.address;
  const runs = req.query.runs;
  const start = req.query.start;
  const imageURI = `ipfs://${req.query.imageuri}`;
  console.log(`runs: ${runs} and start : ${start} and URI : ${imageURI}`);

  // get info from NFT and DAO smart contract we will need and check start is valid
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  const startCheck = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
  const yearAgo = Math.round(Date.now()/1000) - 12*30*24*3600;
  if((startCheck !==0  && startCheck > start && yearAgo < start) || !(runs>=100 && runs<=500)){
    return res.send({success : false, reason : "invalid runs number or start"})
  }

  //get info needed for calculating score and message later
  const accLevels = await DAOInstance.methods.getAccLevels().call();
  const rawPenLevels = await DAOInstance.methods.getPenaltyLevels().call();
  const nonce = await VerifyInstance.methods.nonces(address).call();
  let penLevels = Array(rawPenLevels.length);
  for(var i=0 ; i<penLevels.length; i++){
    if(i==0){
      penLevels[i] = Number(rawPenLevels[i]);
    }
    else{
      penLevels[i] = Number(penLevels[i-1]) + Number(rawPenLevels[i]);
    }
  }

  //get device IMEI and address and load protobuf helpers
  const deviceRes = await dataFetch(address.toLowerCase(), true);
  const deviceIMEI = deviceRes[0].id;
  const deviceAddress = deviceRes[0].address;
  let recordsData, timestamp;
  const pebbleProtoDef = await protobuf.load("pebble.proto");
  const SensorData = pebbleProtoDef.lookupType('SensorData');
  const BinPackage = pebbleProtoDef.lookupType('BinPackage');
  let score = 0;

  //retrieve records and calculate score
  recordsData = await recordsFetch(deviceIMEI, start, runs);

  if(recordsData.length < 100){
    return res.send({success : false, reason : "not enough records for this"})
  }
  recordsData.map((record, index) =>{
    timestamp = record.timestamp;
    const encodedTelemetry = record.raw.replace(/0x/g, '');
    const telemetry = SensorData.decode(Buffer.from(encodedTelemetry,"hex"));
    const accelerometer = telemetry.accelerometer.slice(0,-1);
    const totalAccel = Math.floor(Math.sqrt(Math.pow(accelerometer[0], 2) + Math.pow(accelerometer[1], 2)));
    let k = accLevels.length -1;
    let flag = false;
    while(!flag && k >0){
      if(totalAccel >= accLevels[k]){
        flag = true;
        score += penLevels[k]
        console.log(`accelerometer : ${accelerometer} and totalAccel : ${totalAccel} and timestamp : ${record.timestamp}`);
      }
      k--;
    }
  })
  
  //calculate average, rating
  const average = Math.round(score*100/runs)/100;
  let rating = "Pristine";
  if(average > 7){
    rating = "Poor"
  }
  else if(average > 5){
    rating = "Fair"
  }
  else if(average > 3){
    rating = "Good"
  }
  else if(average > 2){
    rating = "Great"
  }

  //create and upload JSON data for token URI
  let tokenJSON = {};
  tokenJSON['name'] = `Pebble DAO NFT #${tokenIds.length +1} for ${address}`;
  tokenJSON['description'] = "Pebble DAO utilizing verified data from IoTeX Pebble Tracker";
  tokenJSON['image'] = imageURI;
  tokenJSON['attributes'] = {'score' : score, 'runs' : runs, 'lastTimeStamp' : timestamp, 'average' : average, 'rating' : rating}

  const tokenFile = await uploadJSONPinata(tokenJSON);
  const tokenURI = `ipfs://${tokenFile.IpfsHash}`;

  console.log(tokenURI);

  console.log(`deviceIMEI : ${deviceIMEI} and device address : ${deviceAddress} and score : ${score} and avg : ${Math.round(score*100/runs)/100} and timestamp : ${timestamp}`);

  const signature = await verifyNFTInfo(nonce, address, Verify.networks[chainId].address, timestamp, tokenURI, 0);

  console.log(`r is ${signature.r} , s is ${signature.s}, v is ${signature.v}`)


  res.send({success : true, score : score, average : average, lastTimeStamp : timestamp, tokenURI : tokenURI, rating : rating, r : signature.r, s : signature.s, v : signature.v});
})

//route to upload images, called in the beginning of mint function client side
app.post('/mint-upload/:address', upload.single('avatar'), async (req, res) => {
  const address = req.params.address;
  console.log(address)
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  console.log(req.file)
  fs.renameSync(req.file.path, `./uploads/${address}_${tokenIds.length}.png`);
  const urlHash = await uploadImagePinata(`uploads/${address}_${tokenIds.length}.png`);
  res.send({success : true, imageURL : urlHash.IpfsHash})

})

//graphQL query to fetch devices
async function dataFetch(Address, owner) {
  const client = new ApolloClient({
      link: new HttpLink({
          fetch,
          uri: 'https://subgraph.iott.network/subgraphs/name/iotex/pebble-subgraph',
      }),
      cache: new InMemoryCache()
  });

  const queryString = owner ? "owner" : "address" 
  const queryResult = await client.query({
      query: gql`
      {
          devices (where : {${queryString} : "${Address}"}){
            id
            name
            address
            firmware
            lastDataTime
            data
            config
            owner
          }
        }
      `,
  });

  return queryResult.data.devices
}

//graphQL query to fetch records
async function recordsFetch(IMEI, start, amount) {
  const client = new ApolloClient({
      link: new HttpLink({
          fetch,
          uri: 'https://subgraph.iott.network/subgraphs/name/iotex/pebble-subgraph',
      }),
      cache: new InMemoryCache()
  });
 
  const queryResult = await client.query({
      query: gql`
      {
        deviceRecords(where: { imei: "${IMEI}" , timestamp_gt :  ${start}}, orderBy : timestamp, first : ${amount}) {
          raw
          timestamp          
      }
        }
      `,
  });

  return queryResult.data.deviceRecords
}

//helpers for uploading image and JSON to Pinata through API for image URI and token URI
async function uploadImagePinata(file){
  //first part handles the pinning from a folder
  
  let options = { 
      pinataOptions: { cidVersion: 0 }
  };

  let readableStreamforFile;
             
  readableStreamforFile = fs.createReadStream(`./${file}`);
              
  //options.pinataMetadata.keyvalues.description = `This is image ${imageNumber}`;
  const result = await pinata.pinFileToIPFS(readableStreamforFile, options)
                        .catch((err) => {console.log(err);});

  return result;             
}

async function uploadJSONPinata(obj){
  //first part handles the pinning from a folder
  
  let options = { 
      pinataOptions: { cidVersion: 0 }
  };

  const result = await pinata.pinJSONToIPFS(obj, options)
                        .catch((err) => {console.log(err);});

  return result;            
}

const verifyNFTInfo = async function(nonce, account, contract, timestamp, URI, tokenId){
  let wallet = new ethers.Wallet(signingKey);

  const newHashMsg = ethers.utils.solidityKeccak256(["uint256", "address", "address", "uint256", "string", "uint256"], [nonce, account, contract, timestamp, URI, tokenId]);

  const sig = ethersSign(wallet, newHashMsg);

  return sig;

}

//helper to sign a hash iwith a wallet
const ethersSign = async function (wallet, hash) {
  let messageHashBytes = ethers.utils.arrayify(hash);
  let flatSig = await wallet.signMessage(messageHashBytes);

  let sig = ethers.utils.splitSignature(flatSig);

  return sig
}