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
      icon: (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
      ),
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
      icon: (
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.05 9.656h-4.126L16.312 7.44l-.88 1.378 2.27 2.838h4.348z"/>
            <path d="M1.95 9.656h4.126l1.612-2.216.88 1.378-2.27 2.838H1.95z"/>
            <path d="M12 2.25L9.656 7.44h4.688L12 2.25z"/>
            <path d="M12 21.75l2.344-5.19H9.656L12 21.75z"/>
            <path d="M16.312 16.56l-2.656-2.838h-3.312L7.688 16.56 12 21.75l4.312-5.19z"/>
            <path d="M7.688 7.44l2.656 2.838h3.312l2.656-2.838L12 2.25 7.688 7.44z"/>
          </svg>
        </div>
      ),
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
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ zIndex: 9999 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-auto"
        >
          <Card variant="glass" className="p-6 bg-surface/95 border border-stroke/50 shadow-2xl">
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
                <div className="p-4 rounded-xl bg-success/20 border border-success/50 shadow-lg">
                  <p className="text-success font-medium text-center">
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
                      'bg-surface/80 border-stroke/70',
                      'hover:bg-surface-hover hover:border-stroke-light hover:shadow-lg',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      option.isRecommended && 'border-primary/60 bg-primary/10 shadow-md',
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
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;