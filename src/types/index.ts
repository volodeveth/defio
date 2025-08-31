export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  balanceUSD?: number;
}

export interface SwapQuote {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  minAmountOut: string;
  priceImpact: number;
  route: string;
  gasEstimate: string;
  gasUSD: number;
  fee: string;
  feeUSD: number;
}

export interface PortfolioPosition {
  protocol: string;
  type: 'lending' | 'borrowing' | 'liquidity' | 'staking';
  token: Token;
  amount: string;
  amountUSD: number;
  apy: number;
  healthFactor?: number;
}

export interface Alert {
  id: string;
  type: 'health-factor' | 'price-change' | 'yield-change' | 'gas-price';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  isRead: boolean;
}

export interface Activity {
  id: string;
  type: 'swap' | 'deposit' | 'borrow' | 'repay' | 'withdraw';
  tokenIn?: Token;
  tokenOut?: Token;
  amountIn?: string;
  amountOut?: string;
  protocol: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface YieldOpportunity {
  protocol: string;
  token: Token;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  category: 'lending' | 'farming' | 'staking';
}

export interface Protocol {
  name: string;
  logo: string;
  tvl: number;
  supported: boolean;
}

export type SlippageTolerance = 0.1 | 0.5 | 1.0 | 'custom';

export interface SwapSettings {
  slippageTolerance: SlippageTolerance;
  customSlippage?: number;
  deadline: number; // minutes
  expertMode: boolean;
}