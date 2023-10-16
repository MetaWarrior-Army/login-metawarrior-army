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

// Global CSS
import './css/global.css';

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
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }) {
  // use bootstrap js

  return (
    <WagmiConfig config={config}>
    <SessionProvider session={pageProps.session} refetchInterval={0}>
      <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">

        <header className="mb-auto">
          <div>
            <h3 className="float-md-start mb-0">MetaWarrior Army</h3>
            <nav className="nav nav-masthead justify-content-center float-md-end">
              <a className="nav-link fw-bold py-1 px-0" href="/">Home</a>
              <a className="nav-link fw-bold py-1 px-0 active" href="/dev/callback.php">callback</a>
            </nav>
          </div>
        </header>
        <main class="px-3">

            <Component {...pageProps} />

        </main>
      </div>
      </SessionProvider>
        </WagmiConfig>

  );
}

export default MyApp;