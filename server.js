const InsuranceNFT = require('./src/abis/InsuranceNFT.json');
const Verify = require('./src/abis/Verify.json');
const InsuranceDAO = require('./src/abis/InsuranceDAO.json');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const Web3 = require('web3');
const pinataSDK = require('@pinata/sdk');
const { ethers } = require("ethers");
const fs = require('fs');
const fetch = require('cross-fetch');
const {GOERLI_ALCHEMY_KEY, MUMBAI_ALCHEMY_KEY, TEST_NET, SIGNING_KEY, PERSONAL_PINATA_PUBLIC_KEY, PERSONAL_PINATA_SECRET_KEY}= process.env;
const pinata = pinataSDK(PERSONAL_PINATA_PUBLIC_KEY, PERSONAL_PINATA_SECRET_KEY);

const app = express();

const upload = multer({dest: 'uploads/'})

let web3;
let chainId;
let useLocalData = true;
//swap between Goerli and Mumbai testnets
if(TEST_NET === "GOERLI"){
  web3 = new Web3(new Web3.providers.HttpProvider(`https://eth-goerli.g.alchemy.com/v2/${GOERLI_ALCHEMY_KEY}`));
  chainId = 5;
  }
else{
  web3 = new Web3(new Web3.providers.HttpProvider(`https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_ALCHEMY_KEY}`));
  chainId = 80001;
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
  if(useLocalData){
    let deviceExist = address in addressIMEI;
    if (!deviceExist){
      console.log('no devices')
      return res.send({IMEI : ""})
    }
    else{
      const deviceIMEI = addressIMEI[address];
      return res.send({IMEI : deviceIMEI})
    }
  }
  else{
    return res.send({IMEI : ""})
  }
});

//used to render all NFTs for profile
app.get('/user-nfts/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address);
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  const start = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
  let tokenURIs = [tokenIds.length];
  let tokenMetaData = [tokenIds.length]
  if(tokenIds.length==0){
    return res.send({success: false, results : [], start : 0})
  }
  else{
    
    for (var i =0; i<tokenIds.length; i++){
      tokenURIs[i] =  await NFTInstance.methods.tokenURI(tokenIds[i]).call();
    }
    
    return res.send({success : true, results : tokenURIs, start : start});
  }
 
});

//used to render all NFTs for all Dao holdings
app.get('/dao-nfts/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address);
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

//dao join/update call
app.get('/dao-join-update/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address)
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  if(tokenIds.length==0){
    return res.send({success : false, reason : "address has no minted tokens"})
  }
  const currentDAORound = await DAOInstance.methods.getCurrentRound().call();
  const currentDAOToken = await DAOInstance.methods.currentTokenIdForAddr(currentDAORound, address).call();
  if(currentDAOToken > 0 && currentDAOToken == tokenIds[tokenIds.length-1]){
    return res.send({success : false, reason : "needs to mint a new token"})
  }
  const TokenURI = await NFTInstance.methods.tokenURI(tokenIds[tokenIds.length-1]).call();
  const tokenMetaData = await fetch(`https://gateway.pinata.cloud/ipfs/${TokenURI.slice(7)}`);
  const tokenMetaDataBody = await tokenMetaData.json();
  const level = Number(tokenMetaDataBody.attributes.level.split(" ")[0]);
  const costs = await DAOInstance.methods.getCosts().call();
  const timeStamp = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
  const nonce = await VerifyInstance.methods.nonces(address).call();
  const signature = await verifyDAOInfo(nonce, address, Verify.networks[chainId].address, timeStamp, costs.length-level+1, tokenIds[tokenIds.length-1]);
  console.log(`r is ${signature.r}, s is ${signature.s}, v is ${signature.v}, tokenId : ${tokenIds[tokenIds.length-1]}, and timestamp is ${timeStamp}`)

  return res.send({success : true, level : costs.length-level+1, timeStamp : timeStamp, tokenId : tokenIds[tokenIds.length-1], r : signature.r, s : signature.s, v : signature.v});
  
})


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
  let wallet = new ethers.Wallet(SIGNING_KEY);

  const newHashMsg = ethers.utils.solidityKeccak256(["uint256", "address", "address", "uint256", "string", "uint256"], [nonce, account, contract, timestamp, URI, tokenId]);

  const sig = ethersSign(wallet, newHashMsg);

  return sig;

}

const verifyDAOInfo = async function(nonce, account, contract, timestamp, level, tokenId){
  let wallet = new ethers.Wallet(SIGNING_KEY);

  const newHashMsg = ethers.utils.solidityKeccak256(["uint256", "address", "address", "uint256", "uint256", "uint256"], [nonce, account, contract, timestamp, level, tokenId]);

  const sig = ethersSign(wallet, newHashMsg);

  return sig;

}

//helper to sign a hash with a wallet
const ethersSign = async function (wallet, hash) {
  let messageHashBytes = ethers.utils.arrayify(hash);
  let flatSig = await wallet.signMessage(messageHashBytes);

  let sig = ethers.utils.splitSignature(flatSig);

  return sig
}

//Local Data in case TruStream is having issues
const addressIMEI = {
  "0xA072f8Bd3847E21C8EdaAf38D7425631a2A63631" : "100000000000019",
  "0x3fd431F425101cCBeB8618A969Ed8AA7DFD115Ca" : "100000000000023"
}