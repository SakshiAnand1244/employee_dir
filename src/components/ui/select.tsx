import * as React from 'react';
import { cn } from '@/lib/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = 'Select';
