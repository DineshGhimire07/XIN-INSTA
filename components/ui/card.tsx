import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'plain';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'ui-surface shadow-subtle',
    subtle: 'ui-surface-subtle',
    plain: 'bg-transparent border-0 shadow-none p-0',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl transition-all duration-150',
          variant !== 'plain' && 'p-5',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge('flex items-center justify-between pb-3.5 mb-3.5 border-b border-border-subtle', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={twMerge('text-sm font-semibold text-foreground tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}
