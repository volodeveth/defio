// Base App integration for Defio
import { useState, useEffect } from 'react';

export interface BaseAppUser {
  address: string;
  ensName?: string;
  avatar?: string;
  isBaseUser: boolean;
}

export interface BaseAppContext {
  isBaseApp: boolean;
  user?: BaseAppUser;
  isConnected: boolean;
}

class BaseAppService {
  private readonly APP_ID = process.env.NEXT_PUBLIC_BASE_APP_ID || 'defio';

  // Check if running in Base App context
  isInBaseApp(): boolean {
    if (typeof window === 'undefined') return false;
    
    return !!(
      document.referrer.includes('base.org') ||
      document.referrer.includes('wallet.coinbase.com') ||
      window.location.pathname.includes('/baseapp') ||
      // Check for Base App specific user agent or headers
      navigator.userAgent.includes('BaseApp') ||
      // Check for injected Base App provider
      (window as any)?.ethereum?.isBaseWallet
    );
  }

  // Initialize Base App connection
  async initializeBaseApp(): Promise<BaseAppContext> {
    if (!this.isInBaseApp()) {
      return { isBaseApp: false, isConnected: false };
    }

    try {
      // Check if Base App provider is available
      const provider = (window as any)?.ethereum;
      if (!provider?.isBaseWallet) {
        throw new Error('Base App provider not found');
      }

      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }

      const address = accounts[0];
      
      // Get user profile from Base App if available
      const user: BaseAppUser = {
        address,
        isBaseUser: true,
        // Additional user data would be fetched from Base App APIs
      };

      return {
        isBaseApp: true,
        user,
        isConnected: true
      };
    } catch (error) {
      console.error('Base App initialization failed:', error);
      return { 
        isBaseApp: true, 
        isConnected: false 
      };
    }
  }

  // Request user permission for specific actions
  async requestPermission(action: 'swap' | 'approve' | 'sign'): Promise<boolean> {
    if (!this.isInBaseApp()) return true; // Skip if not in Base App

    try {
      // In a real implementation, this would show Base App's permission dialog
      const provider = (window as any)?.ethereum;
      if (!provider?.isBaseWallet) return false;

      // Request permission for the specific action
      const result = await provider.request({
        method: 'wallet_requestPermissions',
        params: [{ [action]: {} }]
      });

      return result && result.length > 0;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  // Send notification to Base App
  async sendNotification(
    type: 'transaction' | 'success' | 'error',
    message: string,
    data?: any
  ): Promise<void> {
    if (!this.isInBaseApp()) return;

    try {
      const provider = (window as any)?.ethereum;
      if (provider?.isBaseWallet && provider.sendNotification) {
        await provider.sendNotification({
          type,
          message,
          data
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Share transaction to Base App social feed
  async shareTransaction(
    txHash: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOut: string
  ): Promise<void> {
    if (!this.isInBaseApp()) return;

    try {
      const shareData = {
        type: 'swap',
        txHash,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        platform: 'Defio',
        timestamp: Date.now()
      };

      const provider = (window as any)?.ethereum;
      if (provider?.isBaseWallet && provider.shareToFeed) {
        await provider.shareToFeed(shareData);
      } else {
        // Fallback: open Base App share dialog
        const shareUrl = this.buildShareUrl(shareData);
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to share transaction:', error);
    }
  }

  // Build share URL for Base App
  private buildShareUrl(data: any): string {
    const baseUrl = 'https://base.org/share';
    const params = new URLSearchParams({
      type: data.type,
      tx: data.txHash,
      app: 'Defio'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Get Base App theme preferences
  getThemePreferences(): 'light' | 'dark' | 'auto' {
    if (!this.isInBaseApp()) return 'auto';
    
    try {
      const provider = (window as any)?.ethereum;
      if (provider?.isBaseWallet && provider.getTheme) {
        return provider.getTheme();
      }
    } catch (error) {
      console.error('Failed to get theme preferences:', error);
    }
    
    return 'auto';
  }

  // Listen for Base App events
  addEventListener(
    event: 'accountsChanged' | 'chainChanged' | 'themeChanged',
    callback: (data: any) => void
  ): () => void {
    if (!this.isInBaseApp()) return () => {};

    const provider = (window as any)?.ethereum;
    if (!provider?.isBaseWallet) return () => {};

    provider.on(event, callback);
    
    return () => {
      provider.removeListener(event, callback);
    };
  }
}

export const baseAppService = new BaseAppService();

// React hook for Base App integration
export function useBaseApp() {
  const [context, setContext] = useState<BaseAppContext>({ 
    isBaseApp: false, 
    isConnected: false 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        const appContext = await baseAppService.initializeBaseApp();
        setContext(appContext);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen for account changes
    const unsubscribeAccounts = baseAppService.addEventListener(
      'accountsChanged',
      (accounts: string[]) => {
        if (accounts.length > 0) {
          setContext(prev => ({
            ...prev,
            user: prev.user ? { ...prev.user, address: accounts[0] } : undefined,
            isConnected: true
          }));
        } else {
          setContext(prev => ({ ...prev, isConnected: false, user: undefined }));
        }
      }
    );

    return unsubscribeAccounts;
  }, []);

  const requestPermission = (action: 'swap' | 'approve' | 'sign') => {
    return baseAppService.requestPermission(action);
  };

  const shareTransaction = (
    txHash: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOut: string
  ) => {
    return baseAppService.shareTransaction(txHash, tokenIn, tokenOut, amountIn, amountOut);
  };

  const sendNotification = (
    type: 'transaction' | 'success' | 'error',
    message: string,
    data?: any
  ) => {
    return baseAppService.sendNotification(type, message, data);
  };

  return {
    ...context,
    isLoading,
    requestPermission,
    shareTransaction,
    sendNotification,
    themePreference: baseAppService.getThemePreferences()
  };
}

// Utility to check if user prefers Base App features
export function shouldShowBaseAppFeatures(): boolean {
  return baseAppService.isInBaseApp();
}

// Utility to format sharing message for Base App
export function formatSwapShareMessage(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  amountOut: string
): string {
  return `Just swapped ${amountIn} ${tokenIn} for ${amountOut} ${tokenOut} on @Defio 🔄\n\nOne-tap DeFi on Base! 🚀`;
}