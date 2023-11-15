'use client'
import { ChakraProvider } from '@chakra-ui/react'


import './globals.css'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


// :::::::::::::::::::::::CONFIGURATION:::::::::::::::::::::::::::::::

const { chains, publicClient } = configureChains(
  [hardhat],
  [
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: 'f06eb38511f11749f70d6ea4e2b955eb',
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
