'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface PortfolioData {
  totalBalance: number;
  totalBalanceChange: number;
  totalBalanceChangePercent: number;
  positions: {
    symbol: string;
    name: string;
    balance: number;
    balanceUSD: number;
    change24h: number;
    changePercent24h: number;
  }[];
}

// Mock portfolio data
const MOCK_PORTFOLIO: PortfolioData = {
  totalBalance: 3735.30,
  totalBalanceChange: 125.45,
  totalBalanceChangePercent: 3.48,
  positions: [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 1245.10,
      balanceUSD: 1245.10,
      change24h: 0,
      changePercent24h: 0,
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      balance: 0.82,
      balanceUSD: 2490.20,
      change24h: 125.45,
      changePercent24h: 5.29,
    },
  ],
};

const PortfolioCard: React.FC = () => {
  const [showBalances, setShowBalances] = useState(true);
  const portfolio = MOCK_PORTFOLIO;

  const isPositiveChange = portfolio.totalBalanceChange >= 0;

  return (
    <Card variant="glass" glow hover className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Portfolio</h2>
        <motion.button
          onClick={() => setShowBalances(!showBalances)}
          className="p-2 rounded-lg hover:bg-surface/50 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showBalances ? (
            <Eye className="w-4 h-4 text-text-tertiary" />
          ) : (
            <EyeOff className="w-4 h-4 text-text-tertiary" />
          )}
        </motion.button>
      </div>

      {/* Total Balance */}
      <div className="space-y-3">
        <div className="text-3xl font-bold text-text-primary">
          {showBalances 
            ? formatCurrency(portfolio.totalBalance) 
            : '••••••'
          }
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
            isPositiveChange 
              ? 'bg-success/20 text-success'
              : 'bg-red-500/20 text-red-400'
          )}>
            {isPositiveChange ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {showBalances 
              ? `${isPositiveChange ? '+' : ''}${formatCurrency(portfolio.totalBalanceChange)}`
              : '••••'
            }
          </div>
          
          <div className="text-text-tertiary text-sm">
            ({isPositiveChange ? '+' : ''}{portfolio.totalBalanceChangePercent.toFixed(2)}%) 24h
          </div>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Assets</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {portfolio.positions.map((position, index) => (
            <motion.div
              key={position.symbol}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-stroke/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm">
                  {position.symbol.charAt(0)}
                </div>
                <div>
                  <div className="text-text-primary font-medium text-sm">
                    {position.symbol}
                  </div>
                  <div className="text-text-tertiary text-xs">
                    {position.name}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-text-primary font-semibold">
                  {showBalances 
                    ? formatCurrency(position.balanceUSD) 
                    : '••••••'
                  }
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-text-tertiary text-sm">
                    {showBalances 
                      ? formatNumber(position.balance)
                      : '••••'
                    } {position.symbol}
                  </div>
                  
                  {position.changePercent24h !== 0 && (
                    <div className={cn(
                      'text-xs font-medium',
                      position.changePercent24h >= 0 
                        ? 'text-success'
                        : 'text-red-400'
                    )}>
                      {position.changePercent24h >= 0 ? '+' : ''}
                      {position.changePercent24h.toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Net Worth Trend */}
      <div className="pt-4 border-t border-stroke/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Net Worth</span>
          <span className="text-text-primary font-medium">
            {showBalances 
              ? formatCurrency(portfolio.totalBalance)
              : '••••••'
            }
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioCard;