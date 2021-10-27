const InsuranceNFT = require('./src/abis/InsuranceNFT.json');
const Verify = require('./src/abis/Verify.json');
const InsuranceDAO = require('./src/abis/InsuranceDAO.json');
const express = require('express'); 
require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
const { ApolloClient, HttpLink, DefaultOptions, InMemoryCache } = require('@apollo/client/core');
const fetch = require('cross-fetch');
const gql = require('graphql-tag');
const protobuf = require("protobufjs");
const projectID = process.env.PROJECT_ID;
const app = express(); 
const testNet = process.env.TEST_NET;
const contractAddressKovan = process.env.KOVAN_CONTRACT_ADDRESS;
const contractAddressIotex = process.env.IOTEX_CONTRACT_ADDRESS;
let web3;
let chainId;

if(testNet=="KOVAN"){
  web3 = new Web3(new Web3.providers.HttpProvider(`https://kovan.infura.io/v3/${projectID}`));
  chainId = 42;
  }
else{
  web3 = new Web3(new Web3.providers.HttpProvider(`https://babel-api.testnet.iotex.io`));
  chainId = 4690;
  }

const port = process.env.SERVER_PORT || 6000;

const NFTInstance = new web3.eth.Contract(InsuranceNFT.abi, InsuranceNFT.networks[chainId].address);
const VerifyInstance = new web3.eth.Contract(Verify.abi, Verify.networks[chainId].address);
const DAOInstance = new web3.eth.Contract(InsuranceDAO.abi, InsuranceDAO.networks[chainId].address);

app.listen(port, () => console.log(`Listening on port ${port}`));
  
app.get('/nft-store/:address', async (req, res) => {
    const address = req.params.address;
    console.log(address);
    object = await dataFetch(address, true) 

  res.send({success : address, results : object}); 
});

app.get('/user-nfts/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address);
  object = await dataFetch(address, true) 

res.send({success : address, results : object}); 
});

app.get('/mint/:address', async (req, res) => {
  const address = req.params.address;
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  const deviceRes = await dataFetch(address, true);
  const deviceIMEI = deviceRes[0].id;
  const deviceAddress = deviceRes[0].address;
  let recordsData;
  const pebbleProtoDef = await protobuf.load("pebble.proto");
  const SensorData = pebbleProtoDef.lookupType('SensorData');
  let decodedRecordsData={};
  let score = 0;


  if(tokenIds.length == 0){ 
    console.log('no NFTs!');
    recordsData = await recordsFetch(deviceIMEI,1635275250, 100);
    recordsData.map((record, index) =>{
      if(index < 5){
      const encodedTelemetry = record.raw.replace(/0x/g, '');
      const telemetry = SensorData.decode(Buffer.from(encodedTelemetry,"hex"));
      const accelerometer = telemetry.accelerometer.slice(0,-1);
      const totalAccel = Math.floor(Math.sqrt(Math.pow(accelerometer[0], 2) + Math.pow(accelerometer[1], 2)));
      console.log(`accelerometer : ${accelerometer} and totalAccel : ${totalAccel}`);
      }
    })

  }
  console.log(`deviceIMEI : ${deviceIMEI} and device address : ${deviceAddress}`);

  res.send({success : true, IMEI : deviceIMEI });
})


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