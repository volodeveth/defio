import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { getAddresses, FEE_TIERS } from '@/constants/addresses';
import { QUOTER_V2_ABI, AERODROME_ROUTER_ABI } from '@/constants/abis';
import { formatUnits, parseUnits } from 'viem';

export interface QuoteParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  decimalsIn: number;
  decimalsOut: number;
}

export interface Quote {
  amountOut: string;
  amountOutFormatted: string;
  route: 'uniswap' | 'aerodrome';
  gasEstimate?: bigint;
  priceImpact?: number;
  fee?: number;
}

export interface QuoteResult {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
}

// Hook for Uniswap V3 quotes
export function useUniswapQuote(params: QuoteParams | null): QuoteResult {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();
  const addresses = getAddresses();

  useEffect(() => {
    if (!params || !publicClient) return;
    
    let isCancelled = false;
    
    const fetchQuote = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const amountIn = parseUnits(params.amountIn, params.decimalsIn);
        
        // Try different fee tiers and pick the best
        const feePromises = Object.values(FEE_TIERS).map(async (fee) => {
          try {
            const result = await publicClient.readContract({
              address: addresses.QUOTER_V2,
              abi: QUOTER_V2_ABI,
              functionName: 'quoteExactInputSingle',
              args: [{
                tokenIn: params.tokenIn as `0x${string}`,
                tokenOut: params.tokenOut as `0x${string}`,
                amountIn,
                fee,
                sqrtPriceLimitX96: 0n
              }]
            });
            
            return {
              amountOut: result[0],
              gasEstimate: result[3],
              fee
            };
          } catch {
            return null;
          }
        });
        
        const results = await Promise.all(feePromises);
        const validResults = results.filter(Boolean);
        
        if (validResults.length === 0) {
          throw new Error('No valid routes found');
        }
        
        // Pick the result with highest output
        const bestResult = validResults.reduce((best, current) => 
          current && (!best || current.amountOut > best.amountOut) ? current : best
        );
        
        if (!isCancelled && bestResult) {
          const amountOutFormatted = formatUnits(bestResult.amountOut, params.decimalsOut);
          
          setQuote({
            amountOut: bestResult.amountOut.toString(),
            amountOutFormatted,
            route: 'uniswap',
            gasEstimate: bestResult.gasEstimate,
            fee: bestResult.fee
          });
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch quote');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchQuote();
    
    return () => {
      isCancelled = true;
    };
  }, [params, publicClient, addresses.QUOTER_V2]);

  return { quote, loading, error };
}

// Hook for Aerodrome quotes
export function useAerodromeQuote(params: QuoteParams | null): QuoteResult {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();
  const addresses = getAddresses();

  useEffect(() => {
    if (!params || !publicClient) return;
    
    let isCancelled = false;
    
    const fetchQuote = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const amountIn = parseUnits(params.amountIn, params.decimalsIn);
        
        // Try both stable and volatile routes
        const routes = [
          // Volatile route
          [{
            from: params.tokenIn as `0x${string}`,
            to: params.tokenOut as `0x${string}`,
            stable: false,
            factory: '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746' as `0x${string}` // Aerodrome factory
          }],
          // Stable route (if both tokens are stablecoins)
          [{
            from: params.tokenIn as `0x${string}`,
            to: params.tokenOut as `0x${string}`,
            stable: true,
            factory: '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746' as `0x${string}`
          }]
        ];
        
        const routePromises = routes.map(async (route) => {
          try {
            const amounts = await publicClient.readContract({
              address: addresses.AERODROME_ROUTER,
              abi: AERODROME_ROUTER_ABI,
              functionName: 'getAmountsOut',
              args: [amountIn, route]
            });
            
            return {
              amountOut: amounts[amounts.length - 1],
              route: route[0].stable ? 'stable' : 'volatile'
            };
          } catch {
            return null;
          }
        });
        
        const results = await Promise.all(routePromises);
        const validResults = results.filter(Boolean);
        
        if (validResults.length === 0) {
          throw new Error('No valid routes found');
        }
        
        // Pick the result with highest output
        const bestResult = validResults.reduce((best, current) => 
          current && (!best || current.amountOut > best.amountOut) ? current : best
        );
        
        if (!isCancelled && bestResult) {
          const amountOutFormatted = formatUnits(bestResult.amountOut, params.decimalsOut);
          
          setQuote({
            amountOut: bestResult.amountOut.toString(),
            amountOutFormatted,
            route: 'aerodrome'
          });
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch quote');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchQuote();
    
    return () => {
      isCancelled = true;
    };
  }, [params, publicClient, addresses.AERODROME_ROUTER]);

  return { quote, loading, error };
}

// Combined hook that gets quotes from both DEXes and returns the best one
export function useBestQuote(params: QuoteParams | null): QuoteResult & { 
  allQuotes: { uniswap: Quote | null; aerodrome: Quote | null } 
} {
  const uniswapResult = useUniswapQuote(params);
  const aerodromeResult = useAerodromeQuote(params);
  
  const loading = uniswapResult.loading || aerodromeResult.loading;
  const error = uniswapResult.error || aerodromeResult.error;
  
  // Determine best quote based on amountOut
  const bestQuote = (() => {
    if (!uniswapResult.quote && !aerodromeResult.quote) return null;
    if (!uniswapResult.quote) return aerodromeResult.quote;
    if (!aerodromeResult.quote) return uniswapResult.quote;
    
    const uniAmount = BigInt(uniswapResult.quote.amountOut);
    const aeroAmount = BigInt(aerodromeResult.quote.amountOut);
    
    return uniAmount > aeroAmount ? uniswapResult.quote : aerodromeResult.quote;
  })();
  
  return {
    quote: bestQuote,
    loading,
    error,
    allQuotes: {
      uniswap: uniswapResult.quote,
      aerodrome: aerodromeResult.quote
    }
  };
}

// Hook to get token balance
export function useTokenBalance(tokenAddress: string | null, userAddress: string | null) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  
  const publicClient = usePublicClient();
  
  useEffect(() => {
    if (!tokenAddress || !userAddress || !publicClient) return;
    
    const fetchBalance = async () => {
      setLoading(true);
      try {
        // Handle ETH balance
        if (tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
          const ethBalance = await publicClient.getBalance({
            address: userAddress as `0x${string}`
          });
          setBalance(formatUnits(ethBalance, 18));
        } else {
          // ERC20 balance
          const erc20Balance = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: [{
              inputs: [{ internalType: "address", name: "owner", type: "address" }],
              name: "balanceOf",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function"
            }],
            functionName: 'balanceOf',
            args: [userAddress as `0x${string}`]
          });
          
          const decimals = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: [{
              inputs: [],
              name: "decimals",
              outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
              stateMutability: "view",
              type: "function"
            }],
            functionName: 'decimals'
          });
          
          setBalance(formatUnits(erc20Balance, decimals));
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance('0');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, [tokenAddress, userAddress, publicClient]);
  
  return { balance, loading };
}