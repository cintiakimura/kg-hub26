import React from 'react';
import { cn } from '@/lib/utils';

export default function KGButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className,
  type = 'button'
}) {
  const variants = {
    primary: "bg-[#00C600] text-white hover:bg-[#00B000] border-2 border-[#00C600]",
    outline: "bg-white text-[#00C600] border-2 border-[#00C600] hover:bg-[#00C600]/10",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 border-2 border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg font-normal transition-colors",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}