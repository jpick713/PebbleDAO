import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { minOptionTokenAbi } from 'abis/otherAbis'
import { CHAINS } from 'utils/chains'
import { convertOpenLoantoLoanItems, convertPastLoantoLoanItems } from 'utils/loans'

import oldLoanData from '../assets/oldLoanData.json'

export interface LoanResponse {
  loanPoolAddr: string
  openLoanItems: any[]
  pastLoanItems: any[]
}

export const getLoansByAccount = async (
  account?: string,
  chainId?: number,
  provider?: Web3Provider
): Promise<LoanResponse> => {
  const chainAsset = CHAINS[chainId!].assets

  const currBlock = await provider?.getBlock('latest')
  const currTimestamp = currBlock!.timestamp
  const currBlockNumber = currBlock!.number

  const optionTokenInstance = new Contract(chainAsset.optionToken, minOptionTokenAbi.abi, provider)

  const apiGetResponse = await fetch(`${process.env.REACT_APP_API_URL}/loans/${account}`)

  if (!apiGetResponse.ok) {
    throw new Error('Loans by account response was not okay')
  }

  const responseBody = await apiGetResponse.json()

  const tempInfo = await Promise.all(
    responseBody.loans.map((loan: Record<string, string>) => {
      return optionTokenInstance.optionInfoByTokenId(loan.loanId).then((currTokenInfo: any) => {
        return {
          loanId: loan.loanId,
          expiryTime: currTimestamp + 4 * (Number(currTokenInfo[2]) - currBlockNumber),
          expiryBlock: Number(currTokenInfo[2]),
          reclaimableColl: currTokenInfo[0],
          repayAmount: currTokenInfo[1],
          exercised: currTokenInfo[3],
          isOpen: !currTokenInfo[3] && currBlockNumber <= Number(currTokenInfo[2]),
          timeRepaid: loan.timeRepaid,
          loanAmount: loan.loanAmount,
          txnHashRepay: loan.txnHashRepay,
          txnHashBorrow: loan.txnHashBorrow
        }
      })
    })
  )

  let openLoanItems: any[] = []
  let pastLoanItems: any[] = []

  const castOldLoanData: any = oldLoanData

  if (account && castOldLoanData && castOldLoanData.hasOwnProperty(account)) {
    openLoanItems = [...castOldLoanData[account].openLoanItems]
    pastLoanItems = [...castOldLoanData[account].pastLoanItems]
  }

  if (tempInfo.length > 0) {
    const tempLoans = tempInfo
    const openLoans: any[] = []
    const pastLoans: any[] = []
    const openLoansFinal: any[] = []
    const pastLoansFinal: any[] = []

    tempLoans.forEach(element => {
      if (element.isOpen) {
        openLoans.push(element)
      } else {
        pastLoans.push(element)
      }
    })

    openLoans.forEach(element => {
      openLoansFinal.push(convertOpenLoantoLoanItems(element, element.expiryTime - currTimestamp))
    })
    pastLoans.forEach(element => {
      pastLoansFinal.push(convertPastLoantoLoanItems(element, element.expiryTime))
    })
    openLoansFinal.forEach(elem => {
      openLoanItems.push(elem)
    })
    pastLoansFinal.forEach(elem => {
      pastLoanItems.push(elem)
    })

    return {
      openLoanItems,
      pastLoanItems,
      loanPoolAddr: chainAsset.loanPool
    }
  } else {
    return {
      openLoanItems,
      pastLoanItems,
      loanPoolAddr: chainAsset.loanPool
    }
  }
}