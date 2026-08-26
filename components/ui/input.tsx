import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ className, label, error, hint, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-foreground-secondary">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          clsx(
            'w-full h-9 px-3 text-xs bg-surface border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-accent transition-all duration-150',
            error ? 'border-status-danger focus:ring-status-danger' : 'border-border-subtle hover:border-border',
            className
          )
        )}
        {...props}
      />
      {error && <p className="text-[11px] text-status-danger">{error}</p>}
      {hint && !error && <p className="text-[11px] text-foreground-muted">{hint}</p>}
    </div>
  );
}
