import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline' | 'purple' | 'blue';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    success: 'bg-status-success-subtle text-status-success border-status-success/20',
    warning: 'bg-status-warning-subtle text-status-warning border-status-warning/20',
    danger: 'bg-status-danger-subtle text-status-danger border-status-danger/20',
    info: 'bg-status-info-subtle text-status-info border-status-info/20',
    blue: 'bg-accent-subtle text-accent border-accent/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    neutral: 'bg-surface-elevated text-foreground-secondary border-border-subtle',
    outline: 'bg-transparent text-foreground-secondary border-border-subtle',
  };

  const dotColors = {
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
    info: 'bg-status-info',
    blue: 'bg-accent',
    purple: 'bg-purple-400',
    neutral: 'bg-foreground-muted',
    outline: 'bg-foreground-muted',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border tabular-nums leading-tight select-none',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}
