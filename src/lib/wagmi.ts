import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, walletConnect, injected, metaMask } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Coinbase Smart Wallet (default for Base App users)
    coinbaseWallet({ 
      appName: 'Defio - DeFi Aggregator',
      appLogoUrl: '/icon.svg',
      preference: 'smartWalletOnly',
      headlessMode: false, // Allow wallet selection
    }),
    // Coinbase regular wallet option
    coinbaseWallet({ 
      appName: 'Defio - DeFi Aggregator',
      appLogoUrl: '/icon.svg',
      preference: 'eoaWalletOnly',
      headlessMode: false,
    }),
    // MetaMask
    metaMask({
      dappMetadata: {
        name: 'Defio',
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://defio.vercel.app',
        iconUrl: '/icon.svg',
      },
    }),
    // WalletConnect for other wallets
    walletConnect({
      projectId,
      metadata: {
        name: 'Defio',
        description: 'DeFi Aggregator for Base Network',
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://defio.vercel.app',
        icons: ['/icon.svg'],
      },
    }),
    // Injected wallets (fallback)
    injected({ 
      shimDisconnect: true,
      target: 'metaMask',
    })
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}