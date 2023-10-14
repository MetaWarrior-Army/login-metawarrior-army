import { createConfig, configureChains, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from 'wagmi/connectors/injected'
import { infuraProvider } from 'wagmi/providers/infura';
import { SessionProvider } from "next-auth/react";
import { mainnet, polygon } from "wagmi/chains";


const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [infuraProvider({ apiKey: process.env.INFURA_API_KEY }), publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({chains})],
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }) {
  return (
    
    <WagmiConfig config={config}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <Component {...pageProps} />
      </SessionProvider>
    </WagmiConfig>
  );
}

export default MyApp;