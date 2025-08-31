'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
  hover?: boolean;
  glow?: boolean;
}

const cardVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    hover = false, 
    glow = false, 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = [
      'rounded-2xl p-6 border',
      'transition-all duration-300 ease-out',
    ];

    const variants = {
      default: [
        'bg-surface border-stroke',
        hover && 'hover:bg-surface-hover hover:border-stroke-light',
        glow && 'hover:shadow-glow',
      ],
      glass: [
        'bg-surface/40 backdrop-blur-xl border-stroke/50',
        'shadow-glass',
        hover && 'hover:bg-surface/60 hover:border-stroke-light/50',
        glow && 'hover:shadow-glow',
      ],
      elevated: [
        'bg-surface border-stroke shadow-elevated',
        hover && 'hover:bg-surface-hover hover:border-stroke-light',
        hover && 'hover:shadow-elevated',
        glow && 'hover:shadow-glow',
      ],
    };

    const Component = hover ? motion.div : 'div';
    const motionProps = hover
      ? {
          variants: cardVariants,
          initial: 'initial',
          whileHover: 'hover',
        }
      : {};

    return (
      <Component
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export default Card;