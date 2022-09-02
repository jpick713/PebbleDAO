import type { AddEthereumChainParameter } from '@web3-react/types'
import { CHAINS as testnetChains } from 'config/testnet.config'
import { CHAINS as mainnetChains } from 'config/mainnet.config'

export const CHAINS = process.env.REACT_APP_NETWORK === 'testnet' ? testnetChains : mainnetChains

export interface BasicChainInformation {
  urls: string[]
  name: string
  assets: {
    USDC: string
    WETH: string
    loanPool: string
    univ2ERC20: string
    optionToken: string
  }
}

export interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency']
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
}

function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
  return !!(chainInformation as ExtendedChainInformation).nativeCurrency
}

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId]
  if (isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls,
      blockExplorerUrls: chainInformation.blockExplorerUrls
    }
  } else {
    return chainId
  }
}

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{ [chainId: number]: string[] }>(
  (accumulator, chainId) => {
    const validURLs: string[] = CHAINS[Number(chainId)].urls

    if (validURLs.length) {
      accumulator[Number(chainId)] = validURLs
    }

    return accumulator
  },
  {}
)