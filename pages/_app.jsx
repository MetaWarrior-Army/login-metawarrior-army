// Wagmi Web3 React Components
import { createConfig, configureChains, WagmiConfig } from "wagmi";

// Web3 Connectors
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'

// Blockchain providers
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from 'wagmi/providers/infura';
// chains
import { mainnet, polygon } from "wagmi/chains";

// Next Auth Session Control
import { SessionProvider } from "next-auth/react";
import  Head  from "next/head";

// Global CSS
import './css/global.css';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [infuraProvider({ apiKey: process.env.INFURA_API_KEY }), publicProvider()]
);

// Setup Web3 connectors
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: '9086ac4b5133bcee5f2c6fff7ef9082a',
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Browser Injected Wallet',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }) {
  return (
    <>
    <Head>
      <title>Authorize Access to MetaWarrior Army</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous"/>
    </Head>

        <WagmiConfig config={config}>
          <SessionProvider session={pageProps.session} refetchInterval={0}>
            <Component {...pageProps} />
          </SessionProvider>
        </WagmiConfig>

    </>
  );
}

export default MyApp;