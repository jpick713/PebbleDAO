import { Contract } from '@ethersproject/contracts'
import { minERC20Abi } from '../abis/otherAbis'
import { CHAINS } from 'utils/chains'
import { Web3Provider } from '@ethersproject/providers'

export interface AccountResponse {
  wethBalance: string
  usdcBalance: string
  wethApproval: string
  usdcApproval: string
  loanPoolAddr: string
  totalSupply: string
}

export const getAccount = async (account?: string, chainId?: number, provider?: Web3Provider): Promise<AccountResponse> => {
  const chainAsset = CHAINS[chainId!].assets

  const usdcInstance = new Contract(chainAsset.USDC, minERC20Abi.abi, provider)
  const wethInstance = new Contract(chainAsset.WETH, minERC20Abi.abi, provider)
  const univ2ERC20Instance = new Contract(chainAsset.univ2ERC20, minERC20Abi.abi, provider)

  const wethBalancePromise = wethInstance.balanceOf(account)
  const usdcBalancePromise = usdcInstance.balanceOf(account)
  const loanPoolUniLpBalancePromise = univ2ERC20Instance.balanceOf(chainAsset.loanPool)

  const uniTotalSupplyPromise = univ2ERC20Instance.totalSupply()
  const wethApprovalPromise = wethInstance.allowance(account, chainAsset.loanPool)
  const usdcApprovalPromise = usdcInstance.allowance(account, chainAsset.loanPool)

  const [wethBalance, usdcBalance, loanPoolUniLpBalance, uniTotalSupply, wethApproval, usdcApproval] =
    await Promise.all([
      wethBalancePromise,
      usdcBalancePromise,
      loanPoolUniLpBalancePromise,
      uniTotalSupplyPromise,
      wethApprovalPromise,
      usdcApprovalPromise
    ])

  return {
    wethBalance,
    usdcBalance,
    usdcApproval,
    wethApproval,
    loanPoolAddr: chainAsset.loanPool,
    totalSupply: uniTotalSupply
  }
}