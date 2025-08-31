'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  Fuel, 
  Shield,
  X,
  CheckCircle,
  Info
} from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Mock alerts data
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'health-factor',
    message: 'Health factor dropped to 1.28 on Aave',
    severity: 'warning',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    isRead: false,
  },
  {
    id: '2',
    type: 'yield-change',
    message: 'APR improved on Aerodrome path',
    severity: 'info',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    isRead: false,
  },
  {
    id: '3',
    type: 'gas-price',
    message: 'Gas below $0.02 — good time to rebalance',
    severity: 'info',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    isRead: true,
  },
];

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'health-factor':
      return Shield;
    case 'yield-change':
      return TrendingUp;
    case 'gas-price':
      return Fuel;
    case 'price-change':
      return TrendingUp;
    default:
      return Info;
  }
};

const getAlertColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical':
      return 'text-red-400 bg-red-500/20';
    case 'warning':
      return 'text-warning bg-warning/20';
    case 'info':
      return 'text-primary bg-primary/20';
    default:
      return 'text-text-tertiary bg-surface/20';
  }
};

const AlertsCard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  return (
    <Card variant="glass" glow hover className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary">Alerts</h2>
          {unreadCount > 0 && (
            <Badge variant="warning" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-text-tertiary"
            >
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No alerts at the moment</p>
              <p className="text-sm">We'll notify you of important updates</p>
            </motion.div>
          ) : (
            alerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type);
              
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    'p-4 rounded-xl border transition-all duration-200',
                    'hover:bg-surface/60 cursor-pointer',
                    alert.isRead 
                      ? 'bg-surface/30 border-stroke/30 opacity-70'
                      : 'bg-surface/60 border-stroke/60'
                  )}
                  onClick={() => !alert.isRead && markAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      getAlertColor(alert.severity)
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium mb-1',
                        alert.isRead ? 'text-text-tertiary' : 'text-text-primary'
                      )}>
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                        
                        {!alert.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                      className="p-1 rounded-md hover:bg-surface/80 text-text-tertiary hover:text-text-primary transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default AlertsCard;