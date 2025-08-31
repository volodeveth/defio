'use client';

import { motion } from 'framer-motion';
import { useAccount, useDisconnect } from 'wagmi';
import { Wallet, Settings, Share, ExternalLink } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { useWalletModal } from '@/hooks/useWalletModal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import WalletConnectModal from '@/components/wallet/WalletConnectModal';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { isOpen, openModal, closeModal } = useWalletModal();

  const handleConnect = () => {
    openModal();
  };

  return (
    <motion.header 
      className="sticky top-0 z-40 w-full border-b border-stroke/50 bg-background/80 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-gradient">Defio</h1>
              <p className="text-xs text-text-tertiary">One-tap DeFi on Base</p>
            </div>
          </motion.div>

          {/* Network & Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">TVL:</span>
                <span className="text-text-primary font-semibold">$8.2B</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">24h Vol:</span>
                <span className="text-text-primary font-semibold">$1.6B</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">Gas:</span>
                <span className="text-success font-semibold">~$0.02</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            {chain && (
              <Badge 
                variant={chain.id === 8453 ? 'primary' : 'warning'}
                size="sm"
              >
                {chain.name}
              </Badge>
            )}

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Share className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Share
            </Button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Wallet className="w-4 h-4" />}
                  onClick={() => disconnect()}
                  className="hidden sm:flex"
                >
                  {formatAddress(address!)}
                </Button>
                
                {/* Mobile wallet button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => disconnect()}
                  className="sm:hidden p-2"
                >
                  <Wallet className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Wallet className="w-4 h-4" />}
                onClick={handleConnect}
              >
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={isOpen} 
        onClose={closeModal} 
      />
    </motion.header>
  );
};

export default Header;