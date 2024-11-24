import { createConfig, http } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, sepolia, goerli, polygonMumbai, arbitrumGoerli, optimismGoerli } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
  throw new Error('Missing VITE_WALLETCONNECT_PROJECT_ID')
}

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const metadata = {
  name: 'RetroToken',
  description: 'RetroToken - Cyberpunk Crypto Dashboard',
  url: 'https://retrotoken.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  // Test networks
  sepolia,
  goerli,
  polygonMumbai,
  arbitrumGoerli,
  optimismGoerli
] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  ssr: false,
  storage: {
    getItem: (key: string) => {
      try {
        const value = window.localStorage.getItem(key)
        return value ? JSON.parse(value) : null
      } catch (error) {
        console.error('Error reading from localStorage:', error)
        return null
      }
    },
    setItem: (key: string, value: unknown) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('Error writing to localStorage:', error)
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        console.error('Error removing from localStorage:', error)
      }
    },
    key: (index: number) => {
      try {
        return window.localStorage.key(index) ?? ''
      } catch (error) {
        console.error('Error accessing localStorage key:', error)
        return ''
      }
    },
    get length() {
      return window.localStorage.length
    }
  }
})

export const modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  defaultChain: mainnet,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Roboto, sans-serif',
    '--w3m-accent-color': '#8B5CF6'
  } as Record<string, string>
})
