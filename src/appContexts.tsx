interface SpinContext {
    globalSpinner: boolean
    setGlobalSpinner: (showSpinner: boolean) => void
    globalTheme: string
    setGlobalTheme: (theme: string) => void
  }

interface AccountTypeContext{
    globalAccount: string,
    setGlobalAccount: (account: string) => void,
    globalActive: boolean,
    setGlobalActive: (active : boolean) => void,
    globalChainId : number,
    setGlobalChainId : (chainId : number) => void
}

export type {SpinContext, AccountTypeContext}