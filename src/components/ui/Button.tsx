'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-xl',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
    ];

    const variants = {
      primary: [
        'bg-gradient-brand text-white shadow-glow',
        'hover:shadow-glow-lg',
        'active:shadow-glow',
        'before:absolute before:inset-0 before:bg-white/10 before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100',
      ],
      secondary: [
        'bg-surface border border-stroke text-text-primary',
        'hover:bg-surface-hover hover:border-stroke-light',
        'hover:shadow-inner-glow',
      ],
      ghost: [
        'text-text-secondary',
        'hover:bg-surface/50 hover:text-text-primary',
      ],
      outline: [
        'border border-primary/50 text-primary bg-transparent',
        'hover:bg-primary/10 hover:border-primary',
        'hover:shadow-glow',
      ],
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-3 text-sm gap-2',
      lg: 'px-8 py-4 text-base gap-3',
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        variants={buttonVariants}
        initial="initial"
        whileHover={!isDisabled ? "hover" : undefined}
        whileTap={!isDisabled ? "tap" : undefined}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        <span className={cn(
          'transition-opacity duration-200',
          isLoading && 'opacity-70'
        )}>
          {children}
        </span>
        
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;