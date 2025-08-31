import { FEE_CONFIG } from '@/constants/addresses';
import { parseUnits, formatUnits } from 'viem';

// Calculate minimum amount out with slippage protection
export function calculateMinAmountOut(
  amountOut: string,
  slippageBps: number = FEE_CONFIG.DEFAULT_SLIPPAGE_BPS,
  decimals: number = 18
): bigint {
  const amount = parseUnits(amountOut, decimals);
  const slippageMultiplier = BigInt(10000 - slippageBps);
  return (amount * slippageMultiplier) / 10000n;
}

// Calculate platform fee amount
export function calculatePlatformFee(
  amountIn: string,
  feeBps: number = FEE_CONFIG.PLATFORM_FEE_BPS,
  decimals: number = 18
): bigint {
  const amount = parseUnits(amountIn, decimals);
  return (amount * BigInt(feeBps)) / 10000n;
}

// Calculate amount after deducting platform fee
export function calculateAmountAfterFee(
  amountIn: string,
  feeBps: number = FEE_CONFIG.PLATFORM_FEE_BPS,
  decimals: number = 18
): bigint {
  const amount = parseUnits(amountIn, decimals);
  const fee = calculatePlatformFee(amountIn, feeBps, decimals);
  return amount - fee;
}

// Calculate deadline timestamp
export function calculateDeadline(minutes: number = FEE_CONFIG.DEFAULT_DEADLINE_MINUTES): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + minutes * 60);
}

// Calculate price impact percentage
export function calculatePriceImpact(
  amountIn: string,
  amountOut: string,
  tokenInPrice: number,
  tokenOutPrice: number,
  decimalsIn: number = 18,
  decimalsOut: number = 18
): number {
  try {
    const amountInFormatted = parseFloat(formatUnits(parseUnits(amountIn, decimalsIn), decimalsIn));
    const amountOutFormatted = parseFloat(formatUnits(parseUnits(amountOut, decimalsOut), decimalsOut));
    
    const expectedValueOut = amountInFormatted * tokenInPrice / tokenOutPrice;
    const actualValueOut = amountOutFormatted;
    
    return ((expectedValueOut - actualValueOut) / expectedValueOut) * 100;
  } catch {
    return 0;
  }
}

// Format number with appropriate decimal places
export function formatTokenAmount(
  amount: string | bigint,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  try {
    const formatted = typeof amount === 'string' 
      ? formatUnits(parseUnits(amount, decimals), decimals)
      : formatUnits(amount, decimals);
    
    const num = parseFloat(formatted);
    
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals
    });
  } catch {
    return '0';
  }
}

// Validate slippage within acceptable bounds
export function validateSlippage(slippageBps: number): boolean {
  return slippageBps > 0 && slippageBps <= FEE_CONFIG.MAX_SLIPPAGE_BPS;
}

// Check if amount exceeds token balance
export function validateBalance(
  amount: string,
  balance: string,
  decimals: number = 18
): boolean {
  try {
    const amountBig = parseUnits(amount, decimals);
    const balanceBig = parseUnits(balance, decimals);
    return amountBig <= balanceBig;
  } catch {
    return false;
  }
}

// Get exchange rate between two amounts
export function getExchangeRate(
  amountIn: string,
  amountOut: string,
  decimalsIn: number = 18,
  decimalsOut: number = 18
): string {
  try {
    const amountInFormatted = parseFloat(formatUnits(parseUnits(amountIn, decimalsIn), decimalsIn));
    const amountOutFormatted = parseFloat(formatUnits(parseUnits(amountOut, decimalsOut), decimalsOut));
    
    if (amountInFormatted === 0) return '0';
    
    const rate = amountOutFormatted / amountInFormatted;
    return rate.toFixed(6);
  } catch {
    return '0';
  }
}

// Format USD value
export function formatUSDValue(value: number): string {
  if (value === 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Check if swap amount is economically viable (covers gas + fees)
export function isSwapViable(
  amountInUSD: number,
  gasEstimateETH: number,
  ethPriceUSD: number,
  platformFeeBps: number = FEE_CONFIG.PLATFORM_FEE_BPS
): boolean {
  const gasCostUSD = gasEstimateETH * ethPriceUSD;
  const platformFeeUSD = amountInUSD * (platformFeeBps / 10000);
  const totalCostUSD = gasCostUSD + platformFeeUSD;
  
  // Swap should be at least 2x the cost to be worthwhile
  return amountInUSD > totalCostUSD * 2;
}

// Generate a unique transaction ID for tracking
export function generateTransactionId(): string {
  return `defio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Encode Uniswap V3 path (token addresses + fees)
export function encodePath(tokens: string[], fees: number[]): string {
  if (tokens.length !== fees.length + 1) {
    throw new Error('Invalid path: tokens and fees length mismatch');
  }
  
  let path = '0x';
  for (let i = 0; i < fees.length; i++) {
    path += tokens[i].slice(2); // Remove 0x prefix
    path += fees[i].toString(16).padStart(6, '0'); // 3 bytes for fee
  }
  path += tokens[tokens.length - 1].slice(2); // Last token
  
  return path;
}

// Decode error messages from transaction failures
export function decodeSwapError(error: any): string {
  const message = error?.message || error?.toString() || '';
  
  if (message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
    return 'Insufficient output amount - try increasing slippage tolerance';
  }
  if (message.includes('INSUFFICIENT_INPUT_AMOUNT')) {
    return 'Insufficient input amount for this trade';
  }
  if (message.includes('EXPIRED')) {
    return 'Transaction expired - please try again';
  }
  if (message.includes('Transfer amount exceeds balance')) {
    return 'Insufficient token balance';
  }
  if (message.includes('Transfer amount exceeds allowance')) {
    return 'Insufficient token allowance - please approve first';
  }
  if (message.includes('IDENTICAL_ADDRESSES')) {
    return 'Cannot swap identical tokens';
  }
  if (message.includes('User rejected')) {
    return 'Transaction was rejected by user';
  }
  
  return 'Swap failed - please try again';
}

// Token list for Base network (initial whitelist)
export const BASE_TOKENS = [
  {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoURI: '/tokens/weth.png'
  },
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: '/tokens/usdc.png'
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: '/tokens/dai.png'
  }
] as const;

export type Token = typeof BASE_TOKENS[number];