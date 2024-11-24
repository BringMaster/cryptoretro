import { createConfig, http, Storage } from 'wagmi'
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

// Custom storage implementation
const customStorage: Storage = {
  getItem: <key extends string, value extends Record<string, unknown>, defaultValue extends value | null | undefined>(
    key: key, 
    defaultValue?: defaultValue
  ): (defaultValue extends null ? value | null : value) | Promise<(defaultValue extends null ? value | null : value)> => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue ?? null
    } catch {
      return defaultValue ?? null
    }
  },
  
  setItem: <key extends string, value extends Record<string, unknown> | null>(
    key: key, 
    value: value
  ): void | Promise<void> => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn('Failed to set item in storage')
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      console.warn('Failed to remove item from storage')
    }
  },
  
  get length(): number {
    try {
      return localStorage.length
    } catch {
      return 0
    }
  },
  
  key: (index: number): string | null => {
    try {
      const result = localStorage.key(index)
      return result ?? null
    } catch {
      return null
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch {
      console.warn('Failed to clear storage')
    }
  }
}

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  ssr: false,
  storage: customStorage,
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
