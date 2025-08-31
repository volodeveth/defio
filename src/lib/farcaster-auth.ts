// Farcaster authentication integration for Defio
import { useState, useEffect } from 'react';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  custodyAddress: string;
  verifications: string[];
}

export interface FarcasterAuthResult {
  isAuthenticated: boolean;
  user?: FarcasterUser;
  token?: string;
  error?: string;
}

class FarcasterAuthService {
  private readonly APP_NAME = 'Defio';
  private readonly REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL || 'https://defio.vercel.app';

  // Check if running in Farcaster frame context
  isInFarcasterContext(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for Farcaster-specific window properties
    return !!(
      window.parent !== window || // In iframe
      document.referrer.includes('warpcast.com') ||
      document.referrer.includes('farcaster.xyz') ||
      window.location.pathname.includes('/miniapp')
    );
  }

  // Get Farcaster user from frame context
  async getFarcasterUser(): Promise<FarcasterUser | null> {
    if (!this.isInFarcasterContext()) return null;

    try {
      // In a real implementation, this would interact with Farcaster Frame API
      // For now, we'll simulate getting user data
      
      // Check if we can get user data from the parent frame
      if (window.parent !== window) {
        return new Promise((resolve) => {
          // Listen for user data from parent
          const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'FARCASTER_USER') {
              window.removeEventListener('message', handleMessage);
              resolve(event.data.user);
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          // Request user data from parent
          window.parent.postMessage({ type: 'GET_FARCASTER_USER' }, '*');
          
          // Timeout after 5 seconds
          setTimeout(() => {
            window.removeEventListener('message', handleMessage);
            resolve(null);
          }, 5000);
        });
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get Farcaster user:', error);
      return null;
    }
  }

  // Sign message with Farcaster identity
  async signMessage(message: string): Promise<string | null> {
    if (!this.isInFarcasterContext()) return null;

    try {
      // In frame context, request signature from parent
      if (window.parent !== window) {
        return new Promise((resolve) => {
          const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'FARCASTER_SIGNATURE') {
              window.removeEventListener('message', handleMessage);
              resolve(event.data.signature);
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          // Request signature from parent
          window.parent.postMessage({ 
            type: 'SIGN_FARCASTER_MESSAGE',
            message 
          }, '*');
          
          // Timeout after 30 seconds
          setTimeout(() => {
            window.removeEventListener('message', handleMessage);
            resolve(null);
          }, 30000);
        });
      }
      
      return null;
    } catch (error) {
      console.error('Failed to sign message with Farcaster:', error);
      return null;
    }
  }

  // Authenticate with Farcaster (for regular web context)
  async authenticateWithFarcaster(): Promise<FarcasterAuthResult> {
    try {
      // If in frame context, try to get user directly
      if (this.isInFarcasterContext()) {
        const user = await this.getFarcasterUser();
        if (user) {
          return {
            isAuthenticated: true,
            user,
            token: 'farcaster_frame_token'
          };
        }
      }

      // For regular web context, redirect to Farcaster auth
      // This is a simplified implementation - real implementation would use Farcaster Connect
      const authUrl = this.buildFarcasterAuthUrl();
      
      // Open popup or redirect based on context
      if (typeof window !== 'undefined') {
        window.open(authUrl, '_blank', 'width=500,height=600,resizable=yes,scrollbars=yes');
      }
      
      return {
        isAuthenticated: false,
        error: 'Authentication in progress - please complete in the popup window'
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Build Farcaster authentication URL
  private buildFarcasterAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FARCASTER_APP_ID || 'defio',
      redirect_uri: `${this.REDIRECT_URI}/auth/farcaster/callback`,
      response_type: 'code',
      scope: 'read write',
      state: this.generateState()
    });

    // This would be the actual Farcaster OAuth endpoint
    return `https://auth.farcaster.xyz/oauth/authorize?${params.toString()}`;
  }

  // Generate random state for OAuth
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Handle OAuth callback
  async handleAuthCallback(code: string, state: string): Promise<FarcasterAuthResult> {
    try {
      // In real implementation, exchange code for token
      const response = await fetch('/api/auth/farcaster/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state })
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const data = await response.json();
      
      return {
        isAuthenticated: true,
        user: data.user,
        token: data.access_token
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Callback handling failed'
      };
    }
  }

  // Store authentication data
  storeAuth(result: FarcasterAuthResult): void {
    if (typeof window === 'undefined') return;
    
    if (result.isAuthenticated && result.user && result.token) {
      localStorage.setItem('farcaster_user', JSON.stringify(result.user));
      localStorage.setItem('farcaster_token', result.token);
    }
  }

  // Get stored authentication
  getStoredAuth(): FarcasterAuthResult | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const user = localStorage.getItem('farcaster_user');
      const token = localStorage.getItem('farcaster_token');
      
      if (user && token) {
        return {
          isAuthenticated: true,
          user: JSON.parse(user),
          token
        };
      }
    } catch (error) {
      console.error('Failed to get stored auth:', error);
    }
    
    return null;
  }

  // Clear authentication
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('farcaster_user');
    localStorage.removeItem('farcaster_token');
  }
}

export const farcasterAuth = new FarcasterAuthService();

// React hook for Farcaster authentication
export function useFarcasterAuth() {
  const [authResult, setAuthResult] = useState<FarcasterAuthResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored auth on mount
    const stored = farcasterAuth.getStoredAuth();
    if (stored) {
      setAuthResult(stored);
    }
  }, []);

  const authenticate = async () => {
    setIsLoading(true);
    try {
      const result = await farcasterAuth.authenticateWithFarcaster();
      setAuthResult(result);
      
      if (result.isAuthenticated) {
        farcasterAuth.storeAuth(result);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    farcasterAuth.clearAuth();
    setAuthResult(null);
  };

  return {
    authResult,
    isLoading,
    authenticate,
    logout,
    isInFrame: farcasterAuth.isInFarcasterContext()
  };
}