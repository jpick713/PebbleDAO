import React from 'react'
import ReactDOM from 'react-dom/client'

import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { StarknetConfig } from '@starknet-react/core'

import { Toaster } from 'react-hot-toast'

import "./assets/animated.css";
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import './assets/style.scss';
import App from './components/App';

import { InjectedConnector } from '@starknet-react/core'

import { hooks as metaMaskHooks, metaMask } from './connectors/metaMask'

import reportWebVitals from './reportWebVitals';

const connectors: [MetaMask, Web3ReactHooks][] = [[metaMask, metaMaskHooks]]

const connectorList = [
      new InjectedConnector({ options: { id: "argentX" } })
    ];

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Web3ReactProvider connectors={connectors}>
    <StarknetConfig connectors={connectorList}>
		  <App />
      <Toaster
        toastOptions={{
          className: 'toast',
          position: 'top-center'
        }}
      />
    </StarknetConfig>
    </Web3ReactProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
