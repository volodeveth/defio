// Base network contract addresses and constants
export const BASE_CHAIN_ID = 8453;

// Core protocol addresses on Base Mainnet
export const ADDRESSES = {
  // Uniswap V3 contracts
  UNIVERSAL_ROUTER: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD' as const,
  QUOTER_V2: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' as const,
  SWAP_ROUTER_02: '0x2626664c2603336E57B271c5C0b26F421741e481' as const,
  
  // Permit2 for gasless approvals
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const,
  
  // Aerodrome (Base native DEX)
  AERODROME_ROUTER: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43' as const,
  
  // Base native tokens
  WETH: '0x4200000000000000000000000000000000000006' as const,
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
  
  // Platform fee recipient (update with actual address)
  FEE_RECIPIENT: '0x0000000000000000000000000000000000000000' as const,
} as const;

// Base Sepolia testnet addresses (for testing)
export const SEPOLIA_ADDRESSES = {
  UNIVERSAL_ROUTER: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD' as const,
  QUOTER_V2: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27' as const,
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const,
  WETH: '0x4200000000000000000000000000000000000006' as const,
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const,
} as const;

// Fee configuration
export const FEE_CONFIG = {
  // Platform fee in basis points (15 bps = 0.15%)
  PLATFORM_FEE_BPS: 15,
  
  // Minimum fee in USD (to avoid dust fees)
  MIN_FEE_USD: 0.01,
  
  // Maximum slippage allowed (200 bps = 2%)
  MAX_SLIPPAGE_BPS: 200,
  
  // Default slippage (50 bps = 0.5%)
  DEFAULT_SLIPPAGE_BPS: 50,
  
  // Transaction deadline in minutes
  DEFAULT_DEADLINE_MINUTES: 15,
} as const;

// Uniswap V3 fee tiers
export const FEE_TIERS = {
  LOWEST: 100, // 0.01%
  LOW: 500,    // 0.05%
  MEDIUM: 3000, // 0.3%
  HIGH: 10000,  // 1%
} as const;

// Token whitelist for initial launch
export const WHITELISTED_TOKENS = [
  ADDRESSES.WETH,
  ADDRESSES.USDC,
  // Add more tokens as needed
] as const;

// Universal Router command types
export const COMMAND_TYPES = {
  V3_SWAP_EXACT_IN: 0x00,
  V3_SWAP_EXACT_OUT: 0x01,
  PERMIT2_TRANSFER_FROM: 0x06,
  PERMIT2_PERMIT_BATCH: 0x07,
  SWEEP: 0x09,
  TRANSFER: 0x0a,
  PAY_PORTION: 0x0b,
  V2_SWAP_EXACT_IN: 0x08,
  V2_SWAP_EXACT_OUT: 0x09,
  PERMIT2_PERMIT: 0x0a,
  WRAP_ETH: 0x0b,
  UNWRAP_WETH: 0x0c,
} as const;

// Helper to get addresses for current network
export function getAddresses(chainId: number = BASE_CHAIN_ID) {
  switch (chainId) {
    case 8453: // Base Mainnet
      return ADDRESSES;
    case 84532: // Base Sepolia
      return SEPOLIA_ADDRESSES;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

export type AddressBook = typeof ADDRESSES;