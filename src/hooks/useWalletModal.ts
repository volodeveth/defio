import { create } from 'zustand';

interface WalletModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useWalletModal = create<WalletModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

// Helper hook for detecting social login context
export function useSocialContext() {
  const isFarcaster = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/miniapp') || 
     window.parent !== window || // In iframe
     document.referrer.includes('warpcast.com'));
     
  const isBaseApp = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/baseapp') ||
     document.referrer.includes('base.org'));

  return {
    isFarcaster,
    isBaseApp,
    isSocialContext: isFarcaster || isBaseApp
  };
}