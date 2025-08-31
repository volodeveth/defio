'use client';

import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  animate?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  dot = false,
  animate = false,
  children,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center font-medium rounded-full border',
    'transition-all duration-200 ease-in-out',
  ];

  const variants = {
    primary: 'bg-primary/20 text-primary border-primary/30',
    secondary: 'bg-surface text-text-secondary border-stroke',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-accent/20 text-accent border-accent/30',
  };

  const sizes = {
    sm: dot ? 'px-2 py-1 text-xs gap-1' : 'px-3 py-1 text-xs',
    md: dot ? 'px-3 py-1.5 text-sm gap-1.5' : 'px-3 py-1.5 text-sm',
    lg: dot ? 'px-4 py-2 text-base gap-2' : 'px-4 py-2 text-base',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const dotColors = {
    primary: 'bg-primary',
    secondary: 'bg-text-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-red-400',
    info: 'bg-accent',
  };

  const badgeContent = (
    <>
      {dot && (
        <div
          className={cn(
            'rounded-full flex-shrink-0',
            dotSizes[size],
            dotColors[variant]
          )}
        />
      )}
      {children}
    </>
  );

  const badgeClasses = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    animate && 'animate-pulse',
    className
  );

  if (animate) {
    return (
      <motion.div
        className={badgeClasses}
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }
        }}
        whileHover={{ scale: 1.05 }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return (
    <div className={badgeClasses} {...props}>
      {badgeContent}
    </div>
  );
};

export default Badge;