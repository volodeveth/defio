import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { getAddresses, FEE_CONFIG } from '@/constants/addresses';
import { UNIVERSAL_ROUTER_ABI } from '@/constants/abis';
import { routeManager, SwapParams } from '@/lib/routing';
import { usePermit2, PermitSignature } from '@/lib/permit2';
import { calculateDeadline, generateTransactionId, decodeSwapError } from '@/lib/swap-utils';
import { Quote } from './useQuotes';

export interface SwapExecutionParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  quote: Quote;
  slippageBps: number;
  usePermit2?: boolean;
  deadline?: bigint;
}

export interface SwapResult {
  hash?: string;
  error?: string;
  transactionId: string;
  timestamp: number;
}

export interface SwapState {
  isLoading: boolean;
  isApproving: boolean;
  isSwapping: boolean;
  error: string | null;
  result: SwapResult | null;
}

export function useSwap() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const addresses = getAddresses();
  
  const {
    createSignatureTransferPermit,
    approveTokenForPermit2,
    requiresPermit2Setup,
    isLoading: permit2Loading,
    error: permit2Error
  } = usePermit2();

  const [state, setState] = useState<SwapState>({
    isLoading: false,
    isApproving: false,
    isSwapping: false,
    error: null,
    result: null
  });

  // Execute swap through Universal Router
  const executeUniversalRouterSwap = useCallback(async (
    params: SwapExecutionParams,
    permit?: PermitSignature
  ): Promise<string> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const deadline = params.deadline || calculateDeadline();
    const swapParams: SwapParams = {
      ...params,
      recipient: address,
      deadline,
      feeBps: FEE_CONFIG.PLATFORM_FEE_BPS,
      feeRecipient: addresses.FEE_RECIPIENT,
      amountOut: params.quote.amountOut
    };

    // Build Universal Router commands
    const { commands, inputs } = routeManager.buildUniversalRouterCommands({
      ...swapParams,
      fee: params.quote.fee || 3000 // Default to 0.3% fee tier
    });

    // Execute the swap
    const hash = await walletClient.writeContract({
      address: addresses.UNIVERSAL_ROUTER,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args: [commands as `0x${string}`, inputs, deadline]
    });

    return hash;
  }, [walletClient, address, addresses]);

  // Main swap function
  const executeSwap = useCallback(async (
    params: SwapExecutionParams
  ): Promise<SwapResult> => {
    const transactionId = generateTransactionId();
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      isApproving: false,
      isSwapping: false,
      error: null,
      result: null
    }));

    try {
      if (!address || !walletClient) {
        throw new Error('Wallet not connected');
      }

      const amountIn = parseUnits(params.amountIn, 18); // Assume 18 decimals for now

      let hash: string;

      if (params.quote.route === 'uniswap') {
        // Handle Uniswap routing through Universal Router
        if (params.usePermit2) {
          // Use Permit2 for gasless approval
          setState(prev => ({ ...prev, isApproving: true }));
          
          const permit = await createSignatureTransferPermit(
            params.tokenIn,
            amountIn,
            addresses.UNIVERSAL_ROUTER
          );

          setState(prev => ({ ...prev, isApproving: false, isSwapping: true }));
          hash = await executeUniversalRouterSwap(params, permit);
        } else {
          // Traditional approach - check if approval is needed
          const { requiresApproval } = await requiresPermit2Setup(
            params.tokenIn,
            amountIn
          );

          if (requiresApproval) {
            setState(prev => ({ ...prev, isApproving: true }));
            await approveTokenForPermit2(params.tokenIn);
          }

          setState(prev => ({ ...prev, isApproving: false, isSwapping: true }));
          hash = await executeUniversalRouterSwap(params);
        }
      } else {
        // Handle Aerodrome routing (simplified for now)
        throw new Error('Aerodrome routing not yet implemented');
      }

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      const result: SwapResult = {
        hash,
        transactionId,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSwapping: false,
        result
      }));

      return result;

    } catch (error: any) {
      const errorMessage = decodeSwapError(error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isApproving: false,
        isSwapping: false,
        error: errorMessage
      }));

      return {
        error: errorMessage,
        transactionId,
        timestamp: Date.now()
      };
    }
  }, [
    address,
    walletClient,
    publicClient,
    addresses,
    createSignatureTransferPermit,
    approveTokenForPermit2,
    requiresPermit2Setup,
    executeUniversalRouterSwap
  ]);

  // Estimate gas for swap
  const estimateSwapGas = useCallback(async (
    params: SwapExecutionParams
  ): Promise<bigint> => {
    if (!publicClient || !address) {
      throw new Error('Client not available');
    }

    try {
      const deadline = calculateDeadline();
      const swapParams: SwapParams = {
        ...params,
        recipient: address,
        deadline,
        feeBps: FEE_CONFIG.PLATFORM_FEE_BPS,
        feeRecipient: addresses.FEE_RECIPIENT,
        amountOut: params.quote.amountOut
      };

      const { commands, inputs } = routeManager.buildUniversalRouterCommands({
        ...swapParams,
        fee: params.quote.fee || 3000
      });

      const gasEstimate = await publicClient.estimateContractGas({
        address: addresses.UNIVERSAL_ROUTER,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: 'execute',
        args: [commands as `0x${string}`, inputs, deadline],
        account: address
      });

      return gasEstimate;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return 250000n; // Fallback gas estimate
    }
  }, [publicClient, address, addresses]);

  // Simulate swap to check for potential issues
  const simulateSwap = useCallback(async (
    params: SwapExecutionParams
  ): Promise<{ success: boolean; error?: string }> => {
    if (!publicClient || !address) {
      throw new Error('Client not available');
    }

    try {
      const deadline = calculateDeadline();
      const swapParams: SwapParams = {
        ...params,
        recipient: address,
        deadline,
        feeBps: FEE_CONFIG.PLATFORM_FEE_BPS,
        feeRecipient: addresses.FEE_RECIPIENT,
        amountOut: params.quote.amountOut
      };

      const { commands, inputs } = routeManager.buildUniversalRouterCommands({
        ...swapParams,
        fee: params.quote.fee || 3000
      });

      await publicClient.simulateContract({
        address: addresses.UNIVERSAL_ROUTER,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: 'execute',
        args: [commands as `0x${string}`, inputs, deadline],
        account: address
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: decodeSwapError(error)
      };
    }
  }, [publicClient, address, addresses]);

  // Check if swap is ready to execute
  const isSwapReady = useCallback((params: SwapExecutionParams): {
    ready: boolean;
    issues: string[];
  } => {
    const issues: string[] = [];

    if (!address) {
      issues.push('Wallet not connected');
    }

    if (!params.quote || !params.quote.amountOut) {
      issues.push('No valid quote available');
    }

    if (parseFloat(params.amountIn) <= 0) {
      issues.push('Invalid input amount');
    }

    if (params.slippageBps > FEE_CONFIG.MAX_SLIPPAGE_BPS) {
      issues.push('Slippage tolerance too high');
    }

    return {
      ready: issues.length === 0,
      issues
    };
  }, [address]);

  // Clear swap state
  const clearSwapState = useCallback(() => {
    setState({
      isLoading: false,
      isApproving: false,
      isSwapping: false,
      error: null,
      result: null
    });
  }, []);

  return {
    ...state,
    executeSwap,
    estimateSwapGas,
    simulateSwap,
    isSwapReady,
    clearSwapState,
    permit2Loading,
    permit2Error
  };
}