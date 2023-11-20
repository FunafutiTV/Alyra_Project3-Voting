'use client'

// ChakraUI
import { ChakraProvider } from '@chakra-ui/react'

// CSS
import './globals.css'

// RainbowKit
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import '@rainbow-me/rainbowkit/styles.css';

// Wagmi
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


// :::::::::::::::::::::::CONFIGURATION:::::::::::::::::::::::::::::::

const { chains, publicClient } = configureChains(
  [hardhat],
  [
      alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
      publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
  chains
});
const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
})


// ::::::::::::::::::::::::::RENDER:::::::::::::::::::::::::::::::::::

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <ChakraProvider>
              {children}
            </ChakraProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
