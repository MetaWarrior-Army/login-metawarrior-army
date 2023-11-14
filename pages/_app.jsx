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
import { mainnet, polygon, polygonZkEvm } from "wagmi/chains";

// Next Auth Session Control
import { SessionProvider } from "next-auth/react";

// Global CSS
import './css/global.css';

// PROJECT CONFIG
import { project } from '../src/config.jsx';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, polygonZkEvm],
  [infuraProvider({ apiKey: project.INFURA_API_KEY }), publicProvider()]
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
        projectId: project.WALLETCONNECT_PROJECTID,
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
      <WagmiConfig config={config}>
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <Component {...pageProps} />
        </SessionProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;