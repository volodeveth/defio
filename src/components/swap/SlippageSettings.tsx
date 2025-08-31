'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSwapStore } from '@/store/swap';
import { SlippageTolerance } from '@/types';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/Input';

const SlippageSettings: React.FC = () => {
  const { settings, setSettings } = useSwapStore();
  const [customInput, setCustomInput] = useState('');

  const presetOptions: { value: SlippageTolerance; label: string }[] = [
    { value: 0.1, label: '0.1%' },
    { value: 0.5, label: '0.5%' },
    { value: 1.0, label: '1.0%' },
  ];

  const handleSlippageChange = (slippage: SlippageTolerance) => {
    setSettings({ 
      slippageTolerance: slippage,
      customSlippage: undefined 
    });
    if (slippage !== 'custom') {
      setCustomInput('');
    }
  };

  const handleCustomSlippageChange = (value: string) => {
    setCustomInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      setSettings({
        slippageTolerance: 'custom',
        customSlippage: numValue,
      });
    }
  };

  const handleDeadlineChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSettings({ deadline: numValue });
    }
  };

  const currentSlippage = settings.slippageTolerance === 'custom' 
    ? settings.customSlippage 
    : settings.slippageTolerance;

  return (
    <div className="p-4 rounded-xl bg-surface/20 border border-stroke/30 space-y-4">
      <h3 className="text-sm font-medium text-text-primary">Transaction Settings</h3>
      
      {/* Slippage Tolerance */}
      <div className="space-y-3">
        <label className="text-xs text-text-secondary">
          Slippage Tolerance
        </label>
        
        <div className="flex gap-2">
          {presetOptions.map((option) => (
            <motion.button
              key={option.value}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'border border-stroke hover:border-stroke-light',
                settings.slippageTolerance === option.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface/50 text-text-secondary hover:text-text-primary'
              )}
              onClick={() => handleSlippageChange(option.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {option.label}
            </motion.button>
          ))}
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Custom"
              value={customInput}
              onChange={(e) => handleCustomSlippageChange(e.target.value)}
              className={cn(
                'w-20 px-3 py-2 text-sm',
                settings.slippageTolerance === 'custom' && 'border-primary'
              )}
              min="0"
              max="50"
              step="0.1"
            />
            <span className="text-xs text-text-tertiary">%</span>
          </div>
        </div>
        
        {currentSlippage && currentSlippage > 5 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-warning flex items-center gap-1"
          >
            ⚠️ High slippage tolerance may result in unfavorable trades
          </motion.div>
        )}
      </div>
      
      {/* Transaction Deadline */}
      <div className="space-y-3">
        <label className="text-xs text-text-secondary">
          Transaction Deadline
        </label>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={settings.deadline.toString()}
            onChange={(e) => handleDeadlineChange(e.target.value)}
            className="w-20 px-3 py-2 text-sm"
            min="1"
            max="180"
          />
          <span className="text-xs text-text-tertiary">minutes</span>
        </div>
      </div>
      
      {/* Expert Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-text-secondary">Expert Mode</div>
          <div className="text-xs text-text-tertiary">
            Allow high price impact trades
          </div>
        </div>
        
        <motion.button
          className={cn(
            'w-10 h-6 rounded-full transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            settings.expertMode ? 'bg-primary' : 'bg-stroke'
          )}
          onClick={() => setSettings({ expertMode: !settings.expertMode })}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{
              x: settings.expertMode ? 20 : 2,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>
    </div>
  );
};

export default SlippageSettings;