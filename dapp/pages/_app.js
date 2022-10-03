// React
import { useState } from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Wagmi
import {
  WagmiConfig,
  createClient,
  configureChains,
} from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

import { validChains } from '../constants';

// Components
import Layout from '../components/utils/Layout';

// Styles
import '../styles/globals.scss';

// Wagmi setup
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID

const { provider, webSocketProvider } = configureChains(
  validChains,
  [
    // infuraProvider({ infuraId }),
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default }),
    }),
    alchemyProvider({ alchemyId }),
    publicProvider()
  ],
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      validChains,
      options: {
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      validChains,
      options: {
        qrcode: true,
        rpc: {
          [56]: `https://bsc-dataseed1.binance.org/`,
          [1]: `https://bsc-dataseed1.binance.org/`
        },
      },
    }),
    new CoinbaseWalletConnector({
      options: {
        appName: 'PawSwap',
        jsonRpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`,
      },
    }),
    new InjectedConnector({
      validChains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider
});

// Render the app
function App({Component, pageProps}) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <WagmiConfig client={client}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WagmiConfig>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default App;