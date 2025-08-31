'use client';

import { motion } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'swap', label: 'Swap', icon: ArrowRightLeft },
  { id: 'earn', label: 'Earn', icon: TrendingUp },
  { id: 'borrow', label: 'Borrow', icon: DollarSign },
];

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 p-1 rounded-2xl bg-surface/50 border border-stroke/50 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        
        return (
          <motion.button
            key={tab.id}
            className={cn(
              'relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              'flex items-center gap-2 min-w-0',
              isActive
                ? 'text-white bg-gradient-brand shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/80'
            )}
            onClick={() => onTabChange(tab.id)}
            whileHover={!isActive ? { scale: 1.02 } : undefined}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <IconComponent className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            
            {/* Active indicator */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-brand"
                layoutId="activeTab"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default Navigation;