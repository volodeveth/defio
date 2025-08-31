'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Settings, Info } from 'lucide-react';
import { useSwapStore } from '@/store/swap';
import { formatNumber, formatCurrency } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import TokenSelector from './TokenSelector';
import SlippageSettings from './SlippageSettings';
import { cn } from '@/lib/utils';

const SwapCard: React.FC = () => {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    quote,
    isQuoting,
    quoteError,
    isSwapping,
    swapError,
    setTokenIn,
    setTokenOut,
    setAmountIn,
    setAmountOut,
    swapTokens,
    setQuote,
    setIsQuoting,
  } = useSwapStore();

  const [showSettings, setShowSettings] = useState(false);

  // Mock quote fetching
  useEffect(() => {
    if (tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0) {
      setIsQuoting(true);
      
      // Simulate API call
      const timer = setTimeout(() => {
        const mockQuote = {
          tokenIn,
          tokenOut,
          amountIn,
          amountOut: (parseFloat(amountIn) * 0.082900).toFixed(6),
          minAmountOut: (parseFloat(amountIn) * 0.082900 * 0.995).toFixed(6),
          priceImpact: 0.05,
          route: 'Aerodrome',
          gasEstimate: '0.0001',
          gasUSD: 0.30,
          fee: '0.20',
          feeUSD: 0.20,
        };
        
        setQuote(mockQuote);
        setAmountOut(mockQuote.amountOut);
        setIsQuoting(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setQuote(null);
      setAmountOut('');
    }
  }, [tokenIn, tokenOut, amountIn, setQuote, setAmountOut, setIsQuoting]);

  const canSwap = tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0 && !isQuoting;
  const priceDisplay = quote ? `1 ${tokenIn?.symbol} = ${formatNumber(3000)} ${tokenOut?.symbol}` : '';

  return (
    <div className="space-y-6">
      <Card variant="glass" glow hover className="relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-text-primary">Swap</h2>
            <Badge dot variant="success" animate>
              Best Route: {quote?.route || 'Aerodrome'}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <SlippageSettings />
          </motion.div>
        )}

        {/* From Token */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">From</span>
            {tokenIn?.balance && (
              <span className="text-sm text-text-tertiary">
                Balance: {tokenIn.balance} {tokenIn.symbol}
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <TokenSelector
                selectedToken={tokenIn}
                onTokenSelect={setTokenIn}
                tokens={[]}
              />
            </div>
            <div className="w-32">
              <Input
                type="number"
                placeholder="0.00"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="text-right text-lg font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center my-4">
          <motion.button
            className={cn(
              'p-3 rounded-xl bg-surface border border-stroke',
              'hover:bg-surface-hover hover:border-stroke-light',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/50'
            )}
            onClick={swapTokens}
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUpDown className="w-5 h-5 text-text-secondary" />
          </motion.button>
        </div>

        {/* To Token */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">To</span>
            <span className="text-sm text-text-tertiary">
              Est. received
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <TokenSelector
                selectedToken={tokenOut}
                onTokenSelect={setTokenOut}
                tokens={[]}
              />
            </div>
            <div className="w-32">
              <Input
                type="number"
                placeholder="0.00"
                value={amountOut}
                onChange={(e) => setAmountOut(e.target.value)}
                className="text-right text-lg font-semibold"
                isLoading={isQuoting}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 p-4 rounded-xl bg-surface/30 border border-stroke/50"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Price</span>
              <span className="text-sm text-text-primary">{priceDisplay}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Route</span>
              <span className="text-sm text-text-primary">{quote.route}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Platform fee</span>
              <span className="text-sm text-text-primary">${quote.feeUSD}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Min. received</span>
              <span className="text-sm text-text-primary">
                {quote.minAmountOut} {tokenOut?.symbol}
              </span>
            </div>
          </motion.div>
        )}

        {/* Swap Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full mt-6"
          disabled={!canSwap}
          isLoading={isSwapping}
        >
          {!tokenIn || !tokenOut
            ? 'Select tokens'
            : !amountIn || parseFloat(amountIn) === 0
            ? 'Enter amount'
            : isQuoting
            ? 'Getting quote...'
            : 'Swap'}
        </Button>

        {/* Error Display */}
        {(quoteError || swapError) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {quoteError || swapError}
          </motion.div>
        )}
      </Card>

      {/* Share to Farcaster */}
      {quote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Info className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-text-secondary">
                  Share this trade to Farcaster (mini-app)
                </span>
              </div>
              <Button variant="outline" size="sm">
                Share Trade
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SwapCard;