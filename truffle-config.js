require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
const fs = require('fs');
//const secrets = JSON.parse(fs.readFileSync(".secret").toString().trim());
const mnemonic = fs.readFileSync(".secret").toString().trim();
const projectID = process.env.PROJECT_ID;
const rinkebyProjectID = process.env.RINKEBY_PROJECT_ID;

module.exports = {
  

  networks: {
    
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },
     
    kovan: {
      provider : () => new HDWalletProvider(mnemonic, `wss://kovan.infura.io/ws/v3/${projectID}`),
      network_id : 42,
      confirmations: 2,
      networkCheckTimeout: 100000,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    rinkeby: {
      provider : () => new HDWalletProvider(mnemonic,  `wss://rinkeby.infura.io/ws/v3/${rinkebyProjectID}`),
      network_id : 4,
      confirmations: 2,
      networkCheckTimeout: 100000,
      timeoutBlocks: 200,
      skipDryRun: true
    }
    
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  contracts_build_directory: './src/abis/',

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.9",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
         runs: 200
        }
      //evmVersion: "byzantium"
      // }
    }
  },
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },

  db: {
    enabled: false
  },
  plugins: [
    'truffle-plugin-verify'
  ]
};
