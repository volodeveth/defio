'use client';

import { SelectHTMLAttributes, forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options,
      placeholder = 'Select an option',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        
        <div className="relative">
          <motion.select
            ref={ref}
            className={cn(
              // Base styles
              'w-full px-4 py-3 rounded-xl border text-text-primary bg-surface/50 backdrop-blur-sm',
              'appearance-none cursor-pointer',
              'transition-all duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
              'pr-10', // Space for chevron icon
              
              // States
              !hasError && !isFocused && 'border-stroke',
              !hasError && isFocused && 'border-primary focus:ring-primary/50 bg-surface',
              hasError && 'border-red-500 focus:ring-red-500/50',
              disabled && 'opacity-50 cursor-not-allowed',
              
              className
            )}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-surface text-text-primary"
              >
                {option.label}
              </option>
            ))}
          </motion.select>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <motion.div
              animate={{
                rotate: isFocused ? 180 : 0,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            </motion.div>
          </div>
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;