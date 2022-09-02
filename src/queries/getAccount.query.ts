import { Contract } from '@ethersproject/contracts'
import { minERC20Abi, minLoanPoolAbi } from 'abis/otherAbis'
import { CHAINS } from 'utils/chains'
import { Web3Provider } from '@ethersproject/providers'

export interface AccountResponse {
  wethBalance: string
  usdcBalance: string
  wethApproval: string
  usdcApproval: string
  reserveUSDC: string
  reserveWETH: string
  loanPoolAddr: string
  loanPoolUniLpBalance: string
  alphaBase: string
  alphaR0: string
  alphaR1: string
  targetUtilization: string
  totalSupply: string
}

export const getAccount = async (account?: string, chainId?: number, provider?: Web3Provider): Promise<AccountResponse> => {
  const chainAsset = CHAINS[chainId!].assets

  const loanPoolInstance = new Contract(chainAsset.loanPool, minLoanPoolAbi.abi, provider)
  const usdcInstance = new Contract(chainAsset.USDC, minERC20Abi.abi, provider)
  const wethInstance = new Contract(chainAsset.WETH, minERC20Abi.abi, provider)
  const univ2ERC20Instance = new Contract(chainAsset.univ2ERC20, minERC20Abi.abi, provider)

  const wethBalancePromise = wethInstance.balanceOf(account)
  const usdcBalancePromise = usdcInstance.balanceOf(account)
  const loanPoolUniLpBalancePromise = univ2ERC20Instance.balanceOf(chainAsset.loanPool)

  const uniTotalSupplyPromise = univ2ERC20Instance.totalSupply()
  const wethApprovalPromise = wethInstance.allowance(account, chainAsset.loanPool)
  const usdcApprovalPromise = usdcInstance.allowance(account, chainAsset.loanPool)
  const reservesPromise = univ2ERC20Instance.getReserves()
  const alphaParamsPromise = loanPoolInstance.getAlphaParams()

  const [wethBalance, usdcBalance, loanPoolUniLpBalance, uniTotalSupply, wethApproval, usdcApproval, reserves, alphaParams] =
    await Promise.all([
      wethBalancePromise,
      usdcBalancePromise,
      loanPoolUniLpBalancePromise,
      uniTotalSupplyPromise,
      wethApprovalPromise,
      usdcApprovalPromise,
      reservesPromise,
      alphaParamsPromise
    ])

  return {
    wethBalance,
    usdcBalance,
    usdcApproval,
    wethApproval,
    loanPoolAddr: chainAsset.loanPool,
    loanPoolUniLpBalance,
    reserveUSDC: reserves._reserve0,
    reserveWETH: reserves._reserve1,
    alphaBase: alphaParams[0],
    alphaR0: alphaParams[1],
    alphaR1: alphaParams[2],
    targetUtilization: alphaParams[3],
    totalSupply: uniTotalSupply
  }
}