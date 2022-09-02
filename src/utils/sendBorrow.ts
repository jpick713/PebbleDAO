import { QueryClient } from '@tanstack/react-query'
import { BigNumber, utils } from 'ethers'
import { FormikState } from 'formik'
import toast from 'react-hot-toast'

import { BorrowInputInterface } from 'pages/borrow'

import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { minERC20Abi, minLoanPoolAbi } from 'abis/otherAbis'

import { CHAINS } from './chains'
import { toastRpcError, toastLoading } from './toast'

export type SendBorrowOptions = {
  amountPledge: BigNumber
  minBorrowAmountUSDC: number
  maxRepayAmountUSDC: number
  txnDeadline: number
  userAddr: string
  wethBalance?: BigNumber
  wethApproval?: BigNumber
  setGlobalSpinner?: (value: boolean) => void
  queryClient: QueryClient
  chainId?: number
  provider?: Web3Provider
  account?: string
  resetForm: (nextState?: Partial<FormikState<BorrowInputInterface>> | undefined) => void
}

export const sendBorrow = async ({
  amountPledge,
  minBorrowAmountUSDC,
  maxRepayAmountUSDC,
  txnDeadline,
  userAddr,
  wethBalance,
  wethApproval,
  setGlobalSpinner,
  queryClient,
  chainId,
  provider,
  account
}: SendBorrowOptions): Promise<number> => {
  const promise: Promise<number> = new Promise(async (resolve, reject) => {
    const chainAsset = CHAINS[chainId!].assets
    let currentLoadingToastId = undefined

    const wethInstance = new Contract(chainAsset.WETH, minERC20Abi.abi, provider?.getSigner(account))
    const loanPoolInstance = new Contract(chainAsset.loanPool, minLoanPoolAbi.abi, provider?.getSigner(account))

    let tempBalance: BigNumber, tempApproval: BigNumber
    if (typeof wethBalance !== undefined && wethBalance !== undefined) {
      tempBalance = wethBalance
    } else {
      tempBalance = BigNumber.from('0')
    }

    if (setGlobalSpinner) {
      setGlobalSpinner(true)
    }

    if (typeof wethApproval !== undefined && wethApproval !== undefined) {
      tempApproval = wethApproval
      if (BigNumber.from(wethApproval).lt(amountPledge)) {
        try {
          const approveWETHReceipt = await wethInstance.approve(chainAsset.loanPool, BigNumber.from(2).pow(256).sub(1))

          currentLoadingToastId = toastLoading(approveWETHReceipt.hash)

          await approveWETHReceipt.wait()

          toast.dismiss(currentLoadingToastId)
          toast.success('You approved WETH')

          tempApproval = BigNumber.from(2).pow(256).sub(1)

          queryClient.setQueryData(['account', account, chainId], (old: any) => ({
            ...old,
            wethApproval: tempApproval
          }))
        } catch (error: any) {
          console.log(error)

          toastRpcError(error, currentLoadingToastId)

          reject(error)
        }
      }
    } else {
      tempApproval = BigNumber.from('0')
    }

    const shiftedMinBorrowAmount = Math.round(minBorrowAmountUSDC * 10 ** 6)
    const shiftedMaxRepayAmount = Math.round(maxRepayAmountUSDC * 10 ** 6)

    try {
      const borrowReceipt = await loanPoolInstance.borrow(
        amountPledge,
        BigNumber.from(shiftedMinBorrowAmount),
        BigNumber.from(shiftedMaxRepayAmount),
        txnDeadline
      )

      currentLoadingToastId = toastLoading(borrowReceipt.hash)

      const confirmationBorrowReceipt = await borrowReceipt.wait()

      const transactionHash = String(confirmationBorrowReceipt.transactionHash)
      const loanId = parseInt(confirmationBorrowReceipt.events[14].topics[3])
      const amountLoaned = parseInt(confirmationBorrowReceipt.events[13].data)

      //put in call to put lambda function for table
      await fetch(`${process.env.REACT_APP_API_URL}/loans`, {
        method: 'POST',
        body: JSON.stringify({
          loanId: String(loanId),
          loanAmount: utils.formatUnits(BigNumber.from(amountLoaned), 6),
          txnHashBorrow: transactionHash,
          account: account?.toString(),
          chainId: chainId?.toString()
        })
      })

      toast.dismiss(currentLoadingToastId)
      toast.success(`You borrowed ${utils.formatUnits(BigNumber.from(amountLoaned), 6)} USDC`)

      queryClient.setQueryData(['account', account, chainId], (old: any) => ({
        ...old,
        wethBalance: !BigNumber.from(tempBalance).isZero() ? BigNumber.from(tempBalance).sub(amountPledge) : old.wethBalance,
        wethApproval: !BigNumber.from(tempApproval).isZero()
          ? BigNumber.from(tempApproval).sub(amountPledge)
          : old.wethApproval
      }))

      resolve(amountLoaned)
    } catch (error: any) {
      console.log(error)

      toastRpcError(error, currentLoadingToastId)

      reject(error)
    }
  })

  promise.finally(() => {
    if (setGlobalSpinner) {
      setGlobalSpinner(false)
    }
  })

  //once get loan amount from receipt, then can maybe also update USDC balance?
  //loanAdded boolean that will tell the loan tab to re-fetch (global context)?
  return promise
}