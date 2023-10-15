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

// Import Bootstrap CSS & JS
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";
import Head from "next/head";


const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [infuraProvider({ apiKey: process.env.INFURA_API_KEY }), publicProvider()]
);

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

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);

  return (
    <>
    <WagmiConfig config={config}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <title>Authorize Access to MetaWarrior Army</title>
      </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </WagmiConfig>

    </>
  );
}

export default MyApp;