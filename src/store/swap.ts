import { create } from 'zustand';
import { Token } from '@/lib/swap-utils';
import { FEE_CONFIG } from '@/constants/addresses';

export interface SwapSettings {
  slippageBps: number;
  deadlineMinutes: number;
  usePermit2: boolean;
  expertMode: boolean;
}

interface SwapStore {
  // Tokens
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  
  // Settings
  slippageBps: number;
  deadlineMinutes: number;
  usePermit2: boolean;
  expertMode: boolean;
  
  // Actions
  setTokenIn: (token: Token | null) => void;
  setTokenOut: (token: Token | null) => void;
  setAmountIn: (amount: string) => void;
  swapTokens: () => void;
  
  setSlippageBps: (slippage: number) => void;
  setDeadlineMinutes: (deadline: number) => void;
  setUsePermit2: (use: boolean) => void;
  setExpertMode: (expert: boolean) => void;
  
  reset: () => void;
}

export const useSwapStore = create<SwapStore>((set, get) => ({
  // Initial state
  tokenIn: null,
  tokenOut: null,
  amountIn: '',
  
  // Settings with defaults
  slippageBps: FEE_CONFIG.DEFAULT_SLIPPAGE_BPS,
  deadlineMinutes: FEE_CONFIG.DEFAULT_DEADLINE_MINUTES,
  usePermit2: true,
  expertMode: false,
  
  // Actions
  setTokenIn: (token) => {
    const { tokenOut } = get();
    // If the new tokenIn is the same as tokenOut, swap them
    if (token && tokenOut && token.address === tokenOut.address) {
      set({ tokenIn: token, tokenOut: null });
    } else {
      set({ tokenIn: token });
    }
  },
  
  setTokenOut: (token) => {
    const { tokenIn } = get();
    // If the new tokenOut is the same as tokenIn, swap them  
    if (token && tokenIn && token.address === tokenIn.address) {
      set({ tokenOut: token, tokenIn: null });
    } else {
      set({ tokenOut: token });
    }
  },
  
  setAmountIn: (amount) => set({ amountIn: amount }),
  
  swapTokens: () => {
    const { tokenIn, tokenOut } = get();
    set({
      tokenIn: tokenOut,
      tokenOut: tokenIn,
    });
  },
  
  setSlippageBps: (slippageBps) => set({ slippageBps }),
  setDeadlineMinutes: (deadlineMinutes) => set({ deadlineMinutes }),
  setUsePermit2: (usePermit2) => set({ usePermit2 }),
  setExpertMode: (expertMode) => set({ expertMode }),
  
  reset: () => set({
    tokenIn: null,
    tokenOut: null,
    amountIn: '',
    slippageBps: FEE_CONFIG.DEFAULT_SLIPPAGE_BPS,
    deadlineMinutes: FEE_CONFIG.DEFAULT_DEADLINE_MINUTES,
    usePermit2: true,
    expertMode: false,
  }),
}));