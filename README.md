
In the project directory, you can run:

### `yarn start`
or
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

This app uses verified Pebble Tracker data to mint NFTs for users that will store an image and the pebble tracker metadata, as well as a calculated score for these users. Then each user can opt to join the DAO and the DAO smart contract will utilize the metadata from the NFT to charge each user according to risk (similar in concept to insurance) and at the end of a specified block, the DAO will pay distribute rewards (after costs for covering drivers) that quarter in an airdrop

### steps to running dApp

1) git clone the repo and cd into root directory

2) npm i or yarn to install all the packages from package.json

3) create a .env file in the root directory (touch .env)

 ### Required Fields in .env

 a) PROJECT_ID (this is the project ID you get from infura when you create a API key for kovan test net, only needed for kovan, it's free!)
 b) PERSONAL_PINATA_PUBLIC_KEY (public key when creating a Pinata account, it's free!)
 c) PERSONAL_PINATA_SECRET_KEY (secret key when creating Pinata account)
 d) Optional - ETHERSCAN_API_KEY (this is for the verify plugin if you want to verify a contract you deploy on your own...)
 e) Optional - PRIVATE_KEY (if you want to run and deploy a new instance, you need this I currently already have deployed an instance you can play with of the contracts (links below), so this is optional)
 f) Optional - SERVER_ADDRESS (address that goes with the private key, this must be added to line 6 in migrations/2_deploy_contracts.js!!)
 g) TEST_NET = KOVAN or IOTEX_TEST (whichever test net you want to use)
 
 Recommended, just use my deployed instance, PRIVATE_KEY = 0x23f9c88d251cb85866b605e71b41962e5cd1fdc50f23b495425101953070bb4b  (don't worry this was just a randomly generated one from ganache and has no real funds, just used to sign messages server side...)

 If you take the hard route and want to deploy yourself, then run 
 ### truffle migrate --network kovan 
 to deploy to kovan or 
 ### truffle migrate --network iotex_test
 to deploy to Iotex test net
