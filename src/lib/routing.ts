import { getAddresses, FEE_CONFIG, COMMAND_TYPES } from '@/constants/addresses';
import { UNIVERSAL_ROUTER_ABI } from '@/constants/abis';
import { calculateMinAmountOut, calculatePlatformFee, calculateDeadline, encodePath } from './swap-utils';
import { encodeAbiParameters, parseAbiParameters } from 'viem';

export interface SwapRoute {
  id: string;
  protocol: 'uniswap' | 'aerodrome';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  minAmountOut: string;
  priceImpact: number;
  gasEstimate?: bigint;
  fee?: number;
  route?: any; // Protocol-specific route data
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageBps: number;
  recipient: string;
  deadline?: bigint;
  feeBps?: number;
  feeRecipient?: string;
}

export class RouteManager {
  private addresses = getAddresses();

  // Build Uniswap Universal Router commands with fee-on-top
  buildUniversalRouterCommands(params: SwapParams & { fee: number }): {
    commands: string;
    inputs: string[];
  } {
    const { tokenIn, tokenOut, amountIn, slippageBps, recipient, fee } = params;
    const deadline = params.deadline || calculateDeadline();
    const feeBps = params.feeBps || FEE_CONFIG.PLATFORM_FEE_BPS;
    const feeRecipient = params.feeRecipient || this.addresses.FEE_RECIPIENT;
    
    const commands: number[] = [];
    const inputs: string[] = [];

    // Command 1: PERMIT2_TRANSFER_FROM - Transfer tokens from user to router
    commands.push(COMMAND_TYPES.PERMIT2_TRANSFER_FROM);
    inputs.push(encodeAbiParameters(
      parseAbiParameters('address,uint256'),
      [tokenIn as `0x${string}`, BigInt(amountIn)]
    ));

    // Command 2: PAY_PORTION - Take platform fee
    if (feeBps > 0) {
      commands.push(COMMAND_TYPES.PAY_PORTION);
      inputs.push(encodeAbiParameters(
        parseAbiParameters('address,address,uint256'),
        [
          tokenIn as `0x${string}`,
          feeRecipient as `0x${string}`,
          BigInt(feeBps)
        ]
      ));
    }

    // Command 3: V3_SWAP_EXACT_IN - Execute the swap
    commands.push(COMMAND_TYPES.V3_SWAP_EXACT_IN);
    const path = encodePath([tokenIn, tokenOut], [fee]);
    const minAmountOut = calculateMinAmountOut(params.amountOut || '0', slippageBps);
    
    inputs.push(encodeAbiParameters(
      parseAbiParameters('address,uint256,uint256,bytes,bool'),
      [
        recipient as `0x${string}`,
        BigInt(amountIn) - calculatePlatformFee(amountIn, feeBps),
        minAmountOut,
        path as `0x${string}`,
        true // payerIsUser
      ]
    ));

    // Command 4: SWEEP - Collect any remaining tokens
    commands.push(COMMAND_TYPES.SWEEP);
    inputs.push(encodeAbiParameters(
      parseAbiParameters('address,address,uint256'),
      [
        tokenOut as `0x${string}`,
        recipient as `0x${string}`,
        0n // minimum amount
      ]
    ));

    return {
      commands: `0x${commands.map(c => c.toString(16).padStart(2, '0')).join('')}`,
      inputs
    };
  }

  // Build Aerodrome swap parameters
  buildAerodromeSwap(params: SwapParams): {
    amountIn: bigint;
    amountOutMin: bigint;
    routes: any[];
    to: string;
    deadline: bigint;
  } {
    const { tokenIn, tokenOut, amountIn, slippageBps, recipient } = params;
    const deadline = params.deadline || calculateDeadline();
    const feeBps = params.feeBps || FEE_CONFIG.PLATFORM_FEE_BPS;
    
    // Deduct platform fee from input amount
    const amountAfterFee = BigInt(amountIn) - calculatePlatformFee(amountIn, feeBps);
    const minAmountOut = calculateMinAmountOut(params.amountOut || '0', slippageBps);

    // Build route (try both stable and volatile)
    const routes = [
      {
        from: tokenIn,
        to: tokenOut,
        stable: false,
        factory: '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746' // Aerodrome factory
      }
    ];

    return {
      amountIn: amountAfterFee,
      amountOutMin: minAmountOut,
      routes,
      to: recipient,
      deadline
    };
  }

  // Compare routes and select the best one
  selectBestRoute(routes: SwapRoute[]): SwapRoute | null {
    if (routes.length === 0) return null;

    return routes.reduce((best, current) => {
      const currentAmountOut = BigInt(current.amountOut);
      const bestAmountOut = BigInt(best.amountOut);
      
      // Primary: highest output amount
      if (currentAmountOut > bestAmountOut) return current;
      if (currentAmountOut < bestAmountOut) return best;
      
      // Tie-breaker: lowest price impact
      if (current.priceImpact < best.priceImpact) return current;
      if (current.priceImpact > best.priceImpact) return best;
      
      // Final tie-breaker: lowest gas cost
      const currentGas = current.gasEstimate || 0n;
      const bestGas = best.gasEstimate || 0n;
      if (currentGas < bestGas) return current;
      
      return best;
    });
  }

  // Calculate route score for ranking
  calculateRouteScore(route: SwapRoute, ethPriceUSD: number = 3000): number {
    const amountOut = parseFloat(route.amountOut);
    const priceImpact = route.priceImpact || 0;
    const gasEstimate = route.gasEstimate || 0n;
    const gasCostUSD = parseFloat(gasEstimate.toString()) * ethPriceUSD / 1e18;
    
    // Score = output amount - price impact penalty - gas cost
    return amountOut - (priceImpact * amountOut / 100) - gasCostUSD;
  }

  // Check if route is economically viable
  isRouteViable(route: SwapRoute, minOutputUSD: number = 1): boolean {
    const amountOut = parseFloat(route.amountOut);
    const priceImpact = route.priceImpact || 0;
    
    // Route should have reasonable price impact and minimum output
    return priceImpact < 5 && amountOut > minOutputUSD;
  }

  // Get route summary for display
  getRouteSummary(route: SwapRoute) {
    return {
      protocol: route.protocol,
      amountOut: route.amountOut,
      priceImpact: route.priceImpact,
      gasEstimate: route.gasEstimate,
      exchangeRate: this.calculateExchangeRate(route.amountIn, route.amountOut),
      minimumReceived: route.minAmountOut
    };
  }

  private calculateExchangeRate(amountIn: string, amountOut: string): number {
    const input = parseFloat(amountIn);
    const output = parseFloat(amountOut);
    return input > 0 ? output / input : 0;
  }
}

// Singleton instance
export const routeManager = new RouteManager();

// Helper functions for route management
export function createRouteId(protocol: string, tokenIn: string, tokenOut: string): string {
  return `${protocol}_${tokenIn}_${tokenOut}_${Date.now()}`;
}

export function isStablePair(tokenA: string, tokenB: string): boolean {
  const stableTokens = [
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
    // Add more stable tokens as needed
  ];
  
  return stableTokens.includes(tokenA.toLowerCase()) && 
         stableTokens.includes(tokenB.toLowerCase());
}

export function shouldUseStableRoute(tokenIn: string, tokenOut: string): boolean {
  return isStablePair(tokenIn, tokenOut);
}

// Route caching for better performance
class RouteCache {
  private cache = new Map<string, { route: SwapRoute; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  getCachedRoute(key: string): SwapRoute | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.route;
  }

  setCachedRoute(key: string, route: SwapRoute): void {
    this.cache.set(key, {
      route,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheKey(tokenIn: string, tokenOut: string, amountIn: string): string {
    return `${tokenIn}_${tokenOut}_${amountIn}`;
  }
}

export const routeCache = new RouteCache();