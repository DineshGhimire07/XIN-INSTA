import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] text-xs';

  const variants = {
    primary:
      'bg-foreground text-canvas hover:bg-foreground/90 font-semibold shadow-subtle',
    secondary:
      'bg-surface-subtle hover:bg-surface-elevated text-foreground border border-border-subtle hover:border-border shadow-subtle',
    outline:
      'bg-transparent hover:bg-surface-subtle text-foreground border border-border-subtle hover:border-border',
    ghost:
      'text-foreground-secondary hover:text-foreground hover:bg-surface-subtle',
    danger:
      'bg-status-danger/10 hover:bg-status-danger/20 text-status-danger border border-status-danger/20',
  };

  const sizes = {
    sm: 'h-7 px-2.5 gap-1.5 text-xs',
    md: 'h-9 px-3.5 gap-2 text-xs',
    lg: 'h-10 px-4 gap-2 text-sm',
    icon: 'h-8 w-8 p-0',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
