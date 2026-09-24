'use client';

import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', leftIcon, rightIcon, isLoading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none whitespace-nowrap';
    
    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs dark:bg-indigo-500 dark:hover:bg-indigo-400',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
      outline: 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 shadow-2xs',
      ghost: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs',
    };

    const sizes = {
      xs: 'px-2 py-1 text-[11px] gap-1 rounded-md',
      sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
      md: 'px-3.5 py-2 text-xs font-semibold gap-2 rounded-lg',
      lg: 'px-4 py-2.5 text-sm font-semibold gap-2 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${className}`}
          {...props}
        />
        {error && <p className="text-[10px] text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {label && <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>}
      <div className="flex items-center gap-1.5">
        <label className="relative cursor-pointer w-6 h-6 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
          <input
            type="color"
            value={value || '#4F46E5'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: value || '#4F46E5' }} />
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-20 px-2 py-1 text-xs uppercase font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full ${sizes[size]} bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export interface PopoverProps {
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Popover({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  trigger,
  children,
  className = '',
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledOpen;
  const handleClose = isControlled ? controlledOnClose : () => setUncontrolledOpen(false);

  if (trigger) {
    return (
      <div className={`relative inline-block ${className}`}>
        <div onClick={() => setUncontrolledOpen(!uncontrolledOpen)} className="inline-block cursor-pointer">
          {trigger}
        </div>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={handleClose} />
            <div className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5">
              {children}
            </div>
          </>
        )}
      </div>
    );
  }

  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={handleClose} />
      <div className="relative z-50">{children}</div>
    </>
  );
}
