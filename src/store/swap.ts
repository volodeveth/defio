import { create } from 'zustand';
import { Token, SwapQuote, SwapSettings } from '@/types';

interface SwapStore {
  // Tokens
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  amountOut: string;
  
  // Quote
  quote: SwapQuote | null;
  isQuoting: boolean;
  quoteError: string | null;
  
  // Settings
  settings: SwapSettings;
  
  // UI State
  isSwapping: boolean;
  swapError: string | null;
  
  // Actions
  setTokenIn: (token: Token | null) => void;
  setTokenOut: (token: Token | null) => void;
  setAmountIn: (amount: string) => void;
  setAmountOut: (amount: string) => void;
  swapTokens: () => void;
  
  setQuote: (quote: SwapQuote | null) => void;
  setIsQuoting: (isQuoting: boolean) => void;
  setQuoteError: (error: string | null) => void;
  
  setSettings: (settings: Partial<SwapSettings>) => void;
  
  setIsSwapping: (isSwapping: boolean) => void;
  setSwapError: (error: string | null) => void;
  
  reset: () => void;
}

export const useSwapStore = create<SwapStore>((set, get) => ({
  // Initial state
  tokenIn: null,
  tokenOut: null,
  amountIn: '',
  amountOut: '',
  
  quote: null,
  isQuoting: false,
  quoteError: null,
  
  settings: {
    slippageTolerance: 0.5,
    deadline: 20,
    expertMode: false,
  },
  
  isSwapping: false,
  swapError: null,
  
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
  setAmountOut: (amount) => set({ amountOut: amount }),
  
  swapTokens: () => {
    const { tokenIn, tokenOut, amountIn, amountOut } = get();
    set({
      tokenIn: tokenOut,
      tokenOut: tokenIn,
      amountIn: amountOut,
      amountOut: amountIn,
      quote: null,
    });
  },
  
  setQuote: (quote) => set({ quote }),
  setIsQuoting: (isQuoting) => set({ isQuoting }),
  setQuoteError: (error) => set({ quoteError: error }),
  
  setSettings: (newSettings) => 
    set((state) => ({ 
      settings: { ...state.settings, ...newSettings } 
    })),
  
  setIsSwapping: (isSwapping) => set({ isSwapping }),
  setSwapError: (error) => set({ swapError: error }),
  
  reset: () => set({
    tokenIn: null,
    tokenOut: null,
    amountIn: '',
    amountOut: '',
    quote: null,
    isQuoting: false,
    quoteError: null,
    isSwapping: false,
    swapError: null,
  }),
}));