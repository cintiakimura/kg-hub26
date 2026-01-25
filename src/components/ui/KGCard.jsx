import React from 'react';
import { cn } from '@/lib/utils';

export default function KGCard({ children, className, onClick, printSafe = true }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border-2 border-[#00C600] rounded-lg p-4 bg-white dark:bg-[#2a2a2a]",
        printSafe && "print:bg-white",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
    >
      {children}
    </div>
  );
}

export function KGCardHeader({ children, className }) {
  return (
    <div className={cn("text-sm text-gray-600 mb-2", className)}>
      {children}
    </div>
  );
}

export function KGCardTitle({ children, className }) {
  return (
    <h3 className={cn("text-base font-normal text-gray-900", className)}>
      {children}
    </h3>
  );
}

export function KGCardContent({ children, className }) {
  return (
    <div className={cn("text-sm text-gray-700", className)}>
      {children}
    </div>
  );
}