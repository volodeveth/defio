'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { Token } from '@/types';
import { cn, formatNumber } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  label?: string;
  disabled?: boolean;
}

// Mock popular tokens for Base
const POPULAR_TOKENS: Token[] = [
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    balance: '1,245.10',
    balanceUSD: 1245.10,
  },
  {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    balance: '0.82',
    balanceUSD: 2490.20,
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    balance: '500.00',
    balanceUSD: 500.00,
  },
  {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    symbol: 'USDbC',
    name: 'USD Base Coin',
    decimals: 6,
    balance: '750.50',
    balanceUSD: 750.50,
  },
];

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  tokens = POPULAR_TOKENS,
  label,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      
      <motion.button
        className={cn(
          'w-full p-4 rounded-xl border border-stroke bg-surface/50 backdrop-blur-sm',
          'flex items-center justify-between',
          'transition-all duration-200 ease-in-out',
          'hover:bg-surface hover:border-stroke-light',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'border-primary bg-surface'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <div className="flex items-center gap-3">
          {selectedToken ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm">
                {selectedToken.symbol.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-text-primary font-medium">
                  {selectedToken.symbol}
                </div>
                <div className="text-text-tertiary text-sm">
                  {selectedToken.name}
                </div>
              </div>
            </>
          ) : (
            <div className="text-text-tertiary">Select a token</div>
          )}
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-tertiary" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute top-full mt-2 left-0 right-0 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Card variant="glass" className="p-4 max-h-80 overflow-hidden">
                <div className="mb-4">
                  <Input
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="text-sm"
                  />
                </div>
                
                {filteredTokens.length === 0 ? (
                  <div className="py-8 text-center text-text-tertiary">
                    No tokens found
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredTokens.map((token) => (
                      <motion.button
                        key={token.address}
                        className={cn(
                          'w-full p-3 rounded-xl flex items-center justify-between',
                          'transition-colors duration-200',
                          'hover:bg-surface/80',
                          selectedToken?.address === token.address &&
                            'bg-primary/10 border border-primary/30'
                        )}
                        onClick={() => handleTokenSelect(token)}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm">
                            {token.symbol.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="text-text-primary font-medium">
                              {token.symbol}
                            </div>
                            <div className="text-text-tertiary text-sm">
                              {token.name}
                            </div>
                          </div>
                        </div>
                        
                        {token.balance && (
                          <div className="text-right">
                            <div className="text-text-primary text-sm">
                              {formatNumber(parseFloat(token.balance))}
                            </div>
                            {token.balanceUSD && (
                              <div className="text-text-tertiary text-xs">
                                ${formatNumber(token.balanceUSD)}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenSelector;