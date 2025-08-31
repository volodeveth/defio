'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      leftIcon,
      rightIcon,
      isLoading,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(error);
    const isDisabled = disabled || isLoading;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            type={type}
            className={cn(
              // Base styles
              'w-full px-4 py-3 rounded-xl border text-text-primary placeholder:text-text-tertiary',
              'bg-surface/50 backdrop-blur-sm',
              'transition-all duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
              
              // Icon spacing
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              // States
              !hasError && !isFocused && 'border-stroke',
              !hasError && isFocused && 'border-primary focus:ring-primary/50 bg-surface',
              hasError && 'border-red-500 focus:ring-red-500/50',
              isDisabled && 'opacity-50 cursor-not-allowed',
              
              // Loading shimmer effect
              isLoading && 'animate-pulse',
              
              className
            )}
            disabled={isDisabled}
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
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          )}
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

Input.displayName = 'Input';

export default Input;