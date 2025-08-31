'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Smartphone, Globe, ExternalLink } from 'lucide-react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { coinbaseWallet, metaMask, walletConnect, injected } from 'wagmi/connectors';
import { useFarcasterAuth } from '@/lib/farcaster-auth';
import { useBaseApp, baseAppService } from '@/lib/base-app-integration';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connector: any;
  isRecommended?: boolean;
  comingSoon?: boolean;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { authenticate: authenticateFarcaster } = useFarcasterAuth();

  // Define wallet options with social login
  const walletOptions: WalletOption[] = [
    {
      id: 'coinbase-smart',
      name: 'Coinbase Smart Wallet',
      description: 'Recommended for Base App users',
      icon: <Wallet className="w-6 h-6 text-blue-500" />,
      connector: coinbaseWallet({ 
        appName: 'Defio',
        preference: 'smartWalletOnly',
        headlessMode: false
      }),
      isRecommended: true,
    },
    {
      id: 'farcaster',
      name: 'Continue with Farcaster',
      description: 'Sign in with your Farcaster account',
      icon: <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">f</div>,
      connector: null, // Will handle separately
      comingSoon: false,
    },
    {
      id: 'base-app',
      name: 'Base App',
      description: 'Native Base ecosystem experience',
      icon: <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">B</div>,
      connector: coinbaseWallet({ 
        appName: 'Defio',
        preference: 'smartWalletOnly'
      }),
      comingSoon: false,
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect using MetaMask',
      icon: <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        </svg>
      </div>,
      connector: metaMask(),
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Connect with 300+ wallets',
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      connector: walletConnect({ 
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
        metadata: {
          name: 'Defio',
          description: 'DeFi Aggregator for Base',
          url: 'https://defio.vercel.app',
          icons: ['/icon.svg']
        }
      }),
    }
  ];

  const handleConnect = async (option: WalletOption) => {
    if (option.comingSoon) return;
    
    setIsConnecting(option.id);
    
    try {
      if (option.id === 'farcaster') {
        await handleFarcasterLogin();
      } else if (option.id === 'base-app') {
        await handleBaseAppLogin();
      } else if (option.connector) {
        await connect({ connector: option.connector });
        onClose();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleBaseAppLogin = async () => {
    try {
      const context = await baseAppService.initializeBaseApp();
      
      if (context.isConnected && context.user) {
        // Base App connection successful
        onClose();
      } else {
        // Redirect to Base App
        window.open('https://wallet.coinbase.com/', '_blank');
      }
    } catch (error) {
      console.error('Base App login failed:', error);
    }
  };

  const handleFarcasterLogin = async () => {
    try {
      const result = await authenticateFarcaster();
      
      if (result.isAuthenticated) {
        onClose();
      }
    } catch (error) {
      console.error('Farcaster login failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-auto"
        >
          <Card variant="glass" className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Choose how you'd like to connect to Defio
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isConnected ? (
              /* Connected State */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                  <p className="text-success text-center">
                    Wallet successfully connected!
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              /* Wallet Options */
              <div className="space-y-3">
                {walletOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConnect(option)}
                    disabled={isConnecting === option.id || isPending}
                    className={cn(
                      'w-full p-4 rounded-xl border transition-all duration-200',
                      'flex items-center gap-4 text-left',
                      'hover:bg-surface-hover hover:border-stroke-light',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      option.isRecommended && 'border-primary/50 bg-primary/5',
                      option.comingSoon && 'opacity-60'
                    )}
                  >
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-primary">
                          {option.name}
                        </p>
                        {option.isRecommended && (
                          <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                            Recommended
                          </span>
                        )}
                        {option.comingSoon && (
                          <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium">
                            Coming Soon
                          </span>
                        )}
                        {option.id === 'farcaster' && (
                          <ExternalLink className="w-3 h-3 text-text-tertiary" />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {option.description}
                      </p>
                    </div>
                    {isConnecting === option.id && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-stroke/50">
              <p className="text-xs text-text-tertiary text-center">
                By connecting, you agree to our{' '}
                <button className="text-primary hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-primary hover:underline">
                  Privacy Policy
                </button>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalletConnectModal;