import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import Header from './menu/header';
import Landing from './pages/Landing';
import Mint from './pages/mint';
//import { createGlobalStyle } from 'styled-components';
import Collection from './pages/collection';
import Holdings from './pages/holdings';
import { AccountTypeContext } from './../appContexts';

// const GlobalStyles = createGlobalStyle`
//   :root {
//     scroll-behavior: unset;
//   }
// `;

const queryClient = new QueryClient()

export const AccountContext = createContext<Partial<AccountTypeContext>>({});

const App: React.FC = () => {
  const [globalAccount, setGlobalAccount] = useState("");
  const [globalActive, setGlobalActive] = useState(false);
  const [globalChainId, setGlobalChainId] = useState(0)

  return (
    <div className="wrapper">
      <AccountContext.Provider value={{globalAccount, setGlobalAccount, globalActive, setGlobalActive, globalChainId, setGlobalChainId}}>
        <Header/>
        <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />}>
              <Route path="/profile" element={<Collection />} />
              <Route path="/holdings" element={<Holdings />} />
              <Route path="/mint" element={<Mint />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </AccountContext.Provider>    
    </div>
  );
}

export default App;
