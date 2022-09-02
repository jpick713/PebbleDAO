import { BasicChainInformation, ExtendedChainInformation } from 'utils/chains'

export const CHAINS: { [chainId: number]: BasicChainInformation | ExtendedChainInformation } = {
  1: {
    urls: [
      process.env.REACT_APP_INFURA_ID ? `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}` : '',
      process.env.REACT_APP_ALCHEMY_KEY ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_KEY}` : '',
      'https://cloudflare-eth.com'
    ].filter(url => url !== ''),
    name: 'Mainnet',
    assets: {
      USDC: '0x0000000000000000000000000000000000000000',
      WETH: '0x0000000000000000000000000000000000000000',
      loanPool: '0x0000000000000000000000000000000000000000',
      univ2ERC20: '0x0000000000000000000000000000000000000000',
      optionToken: '0x0000000000000000000000000000000000000000'
    }
  }
}