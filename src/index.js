// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import * as fcl from "@onflow/fcl"

// fcl.config()
//   // connect to Flow testnet
//   .put("accessNode.api", "https://access-testnet.onflow.org")
//   // use Blocto testnet wallet
//   .put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn")

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();


import React from 'react';
import ReactDOM from 'react-dom';
import Navbar from './components/Navbar'
import Providers from './providers/Providers.comp';
import Routes from './components/Routes.comp'
import { ROUTES } from './config/routes.config';

import './index.css';
import './components/Atom.css'
import * as fcl from "@onflow/fcl"

fcl.config()
  .put("accessNode.api", "https://access-testnet.onflow.org")
  .put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn")
  .put("0xCryptoLeague","REACT_APP_CONTRACT_CRYPTOLEAGUE")
  .put("0xFUSD","REACT_APP_FUSD_CONTRACT")
  .put("0xFungibleToken","REACT_APP_FT_CONTRACT")

ReactDOM.render(
  <Providers>
    <Navbar />
    <Routes routes={ROUTES} />
  </Providers>,
  document.getElementById('root')
);