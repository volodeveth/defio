'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRightLeft, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  DollarSign,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Activity } from '@/types';
import { formatTimeAgo, formatAddress, formatNumber } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// Mock activity data
const MOCK_ACTIVITY: Activity[] = [
  {
    id: '1',
    type: 'swap',
    tokenIn: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    tokenOut: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    amountIn: '200',
    amountOut: '0.0667',
    protocol: 'Aerodrome',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    status: 'success',
  },
  {
    id: '2',
    type: 'deposit',
    tokenIn: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    amountIn: '500',
    protocol: 'Aave',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    status: 'success',
  },
  {
    id: '3',
    type: 'swap',
    tokenIn: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    tokenOut: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    amountIn: '50',
    amountOut: '0.0167',
    protocol: 'Uniswap',
    txHash: '0xdef1234567890abcdef1234567890abcdef123456',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // Yesterday
    status: 'success',
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'swap':
      return ArrowRightLeft;
    case 'deposit':
      return ArrowDownToLine;
    case 'withdraw':
      return ArrowUpFromLine;
    case 'borrow':
      return DollarSign;
    case 'repay':
      return DollarSign;
    default:
      return ArrowRightLeft;
  }
};

const getStatusIcon = (status: Activity['status']) => {
  switch (status) {
    case 'success':
      return CheckCircle;
    case 'failed':
      return XCircle;
    case 'pending':
      return Clock;
    default:
      return Clock;
  }
};

const getStatusColor = (status: Activity['status']) => {
  switch (status) {
    case 'success':
      return 'text-success';
    case 'failed':
      return 'text-red-400';
    case 'pending':
      return 'text-warning';
    default:
      return 'text-text-tertiary';
  }
};

const formatActivityDescription = (activity: Activity) => {
  switch (activity.type) {
    case 'swap':
      return `${formatNumber(parseFloat(activity.amountIn!))} ${activity.tokenIn?.symbol} → ${formatNumber(parseFloat(activity.amountOut!))} ${activity.tokenOut?.symbol}`;
    case 'deposit':
      return `${formatNumber(parseFloat(activity.amountIn!))} ${activity.tokenIn?.symbol} to ${activity.protocol}`;
    case 'withdraw':
      return `${formatNumber(parseFloat(activity.amountOut!))} ${activity.tokenOut?.symbol} from ${activity.protocol}`;
    case 'borrow':
      return `${formatNumber(parseFloat(activity.amountOut!))} ${activity.tokenOut?.symbol} from ${activity.protocol}`;
    case 'repay':
      return `${formatNumber(parseFloat(activity.amountIn!))} ${activity.tokenIn?.symbol} to ${activity.protocol}`;
    default:
      return 'Unknown transaction';
  }
};

const ActivityCard: React.FC = () => {
  const activity = MOCK_ACTIVITY;

  const openTransaction = (txHash: string) => {
    window.open(`https://basescan.org/tx/${txHash}`, '_blank');
  };

  return (
    <Card variant="glass" glow hover className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
        <Badge variant="secondary" size="sm">
          {activity.length} transactions
        </Badge>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activity.length === 0 ? (
          <div className="py-8 text-center text-text-tertiary">
            <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Your transactions will appear here</p>
          </div>
        ) : (
          activity.map((item, index) => {
            const ActivityIcon = getActivityIcon(item.type);
            const StatusIcon = getStatusIcon(item.status);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-4 rounded-xl border border-stroke/50 bg-surface/30',
                  'hover:bg-surface/50 hover:border-stroke/70 cursor-pointer',
                  'transition-all duration-200'
                )}
                onClick={() => openTransaction(item.txHash)}
              >
                <div className="flex items-start gap-3">
                  {/* Activity Icon */}
                  <div className="p-2 rounded-lg bg-primary/20 text-primary flex-shrink-0">
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Activity Type */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-text-primary capitalize">
                        {item.type}
                      </span>
                      <span className="text-text-tertiary">—</span>
                      <span className="text-text-secondary text-sm">
                        {formatActivityDescription(item)}
                      </span>
                    </div>
                    
                    {/* Transaction Details */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-text-tertiary">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-text-tertiary">Via</span>
                          <span className="text-text-secondary font-medium">
                            {item.protocol}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Status */}
                        <div className={cn(
                          'flex items-center gap-1',
                          getStatusColor(item.status)
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="text-xs capitalize">{item.status}</span>
                        </div>
                        
                        {/* External Link */}
                        <ExternalLink className="w-3 h-3 text-text-tertiary" />
                      </div>
                    </div>
                    
                    {/* Transaction Hash */}
                    <div className="mt-2 text-xs text-text-tertiary font-mono">
                      {formatAddress(item.txHash, 6)}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default ActivityCard;