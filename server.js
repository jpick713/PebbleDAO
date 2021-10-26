import { uploadFilesToWeb3Storage } from './src/services/web3-storage/web3-storage.js'
import { storeNFTData } from './src/services/nft-storage/nft-storage.js'

const express = require('express'); //Line 1
const app = express(); //Line 2
require('dotenv').config();




const port = process.env.SERVER_PORT || 6000;
const fs = require('fs');

app.listen(port, () => console.log(`Listening on port ${port}`)); 

async function main(){
    const { files, rootCid } = await uploadFilesToWeb3Storage()
  
    console.log({  files, rootCid });
    
    const nftRecord = {
      root : rootCid,
      fileNames : files.map(f => (f._name)).filter(name => (name.endsWith(".jpg")))
    }
  
    if(nftRecord.fileNames.length>0){
      const imgIndex = Math.floor(Math.random()*nftRecord.fileNames.length)
      console.log(`${imgIndex} and ${nftRecord.fileNames.length}`);
      let nameWithOutExt = nftRecord.fileNames[imgIndex].split('.')[0];
      nameWithOutExt = nameWithOutExt.replace(/\//g, '__');
      const nftFileName = nameWithOutExt.split('__').pop();
      console.log(nftFileName);
      const unixTime = Math.floor(Date.now() / 1000);
      const description = `Being Minted at ${unixTime}`;
      const tokenURI = await storeNFTData(nftFileName, description, "InsertDID", "interesting_quest");
      console.log(tokenURI);
    }

  }
  

// create a GET route
app.get('/nft-store/:tokenId', (req, res) => {
    let tokenId = req.params.tokenId;
    console.log(tokenId);

    let rawdata = fs.readFileSync('metadataNFT.json');
    let metadataNFT = JSON.parse(rawdata);
    let tokenMetadata = metadataNFT[tokenId];

    main();


  res.send({success : tokenMetadata['name']}); 
});