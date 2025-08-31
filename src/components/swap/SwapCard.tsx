'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Settings, Info, AlertTriangle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSwapStore } from '@/store/swap';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { useBestQuote, QuoteParams } from '@/hooks/useQuotes';
import { useSwap } from '@/hooks/useSwap';
import { useWalletModal } from '@/hooks/useWalletModal';
import { BASE_TOKENS, formatTokenAmount, getExchangeRate } from '@/lib/swap-utils';
import { FEE_CONFIG } from '@/constants/addresses';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import TokenSelector from './TokenSelector';
import SlippageSettings from './SlippageSettings';
import { cn } from '@/lib/utils';

const SwapCard: React.FC = () => {
  const { address } = useAccount();
  const { openModal } = useWalletModal();
  const {
    tokenIn,
    tokenOut,
    amountIn,
    slippageBps = FEE_CONFIG.DEFAULT_SLIPPAGE_BPS,
    setTokenIn,
    setTokenOut,
    setAmountIn,
    swapTokens,
  } = useSwapStore();

  const [showSettings, setShowSettings] = useState(false);

  // Build quote params
  const quoteParams: QuoteParams | null = 
    tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0 
      ? {
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amountIn,
          decimalsIn: tokenIn.decimals,
          decimalsOut: tokenOut.decimals,
        }
      : null;

  // Get quotes from multiple DEXes
  const { quote, loading: isQuoting, error: quoteError, allQuotes } = useBestQuote(quoteParams);
  
  // Swap execution
  const {
    executeSwap,
    estimateSwapGas,
    simulateSwap,
    isSwapReady,
    isLoading: isSwapping,
    isApproving,
    error: swapError,
    result: swapResult,
  } = useSwap();

  // Handle swap execution
  const handleSwap = async () => {
    if (!quote || !tokenIn || !tokenOut || !address) return;

    try {
      const result = await executeSwap({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn,
        quote,
        slippageBps,
        usePermit2: true, // Use Permit2 for better UX
      });

      if (result.hash) {
        // Swap successful - could show success modal or redirect
        console.log('Swap successful:', result);
      }
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  // Check if swap is ready
  const { ready: canSwap, issues } = isSwapReady({
    tokenIn: tokenIn?.address || '',
    tokenOut: tokenOut?.address || '',
    amountIn,
    quote: quote!,
    slippageBps,
  });

  // Calculate display values
  const exchangeRate = quote ? getExchangeRate(amountIn, quote.amountOutFormatted, tokenIn?.decimals, tokenOut?.decimals) : '0';
  const priceDisplay = quote ? `1 ${tokenIn?.symbol} = ${exchangeRate} ${tokenOut?.symbol}` : '';
  const platformFeeUSD = parseFloat(amountIn) * 0.001 * (FEE_CONFIG.PLATFORM_FEE_BPS / 10000); // Rough calculation

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
                tokens={BASE_TOKENS}
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
                tokens={BASE_TOKENS}
              />
            </div>
            <div className="w-32">
              <Input
                type="number"
                placeholder="0.00"
                value={quote?.amountOutFormatted || ''}
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary capitalize">{quote.route}</span>
                {quote.route === 'uniswap' && quote.fee && (
                  <Badge variant="outline" size="sm">{quote.fee / 10000}%</Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Platform fee</span>
              <span className="text-sm text-text-primary">
                {FEE_CONFIG.PLATFORM_FEE_BPS / 100}% (~${platformFeeUSD.toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Min. received</span>
              <span className="text-sm text-text-primary">
                {formatTokenAmount(quote.amountOut, tokenOut?.decimals)} {tokenOut?.symbol}
              </span>
            </div>
            {quote.priceImpact && quote.priceImpact > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-tertiary">Price Impact</span>
                <span className={cn(
                  "text-sm",
                  quote.priceImpact > 5 ? "text-red-400" : "text-warning"
                )}>
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Swap Button */}
        <div className="mt-6 space-y-3">
          {!address ? (
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              onClick={openModal}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canSwap || isQuoting}
              isLoading={isSwapping || isApproving}
              onClick={handleSwap}
            >
              {isApproving
                ? 'Approving...'
                : isSwapping
                ? 'Swapping...'
                : !tokenIn || !tokenOut
                ? 'Select tokens'
                : !amountIn || parseFloat(amountIn) === 0
                ? 'Enter amount'
                : isQuoting
                ? 'Getting quote...'
                : issues.length > 0
                ? issues[0]
                : 'Swap'}
            </Button>
          )}
          
          {/* Route comparison */}
          {allQuotes.uniswap && allQuotes.aerodrome && (
            <div className="text-xs text-text-tertiary text-center">
              Comparing {Object.values(allQuotes).filter(Boolean).length} routes
            </div>
          )}
        </div>

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