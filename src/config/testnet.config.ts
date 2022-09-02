import { BasicChainInformation, ExtendedChainInformation } from 'utils/chains'

export const CHAINS: { [chainId: number]: BasicChainInformation | ExtendedChainInformation } = {
  42: {
    urls: [process.env.REACT_APP_INFURA_ID ? `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}` : ''].filter(
      url => url !== ''
    ),
    name: 'Kovan',
    assets: {
      USDC: '0x7e97B4633BaB97F8F76461Cc627cF6B74D2Ad256',
      WETH: '0xEA634604095568955F7F078959d454b7dC4c0320',
      loanPool: '0x66140530c93de1efb1e8a254a50ed4f22c407945',
      univ2ERC20: '0xf9194ac66738dded27ee336f60989d52eadfc564',
      optionToken: '0xa3bc1d2934478646a9c37b17951d8bddae1a25d7'
    }
  }
}