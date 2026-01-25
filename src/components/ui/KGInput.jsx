import React from 'react';
import { cn } from '@/lib/utils';

export default function KGInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className,
  error,
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-gray-600">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border-2 border-[#00C600] rounded-lg text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[#00C600]/30",
          "placeholder:text-gray-400",
          disabled && "bg-gray-100 cursor-not-allowed",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function KGTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-gray-600">{label}</label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border-2 border-[#00C600] rounded-lg text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[#00C600]/30",
          "placeholder:text-gray-400 resize-none",
          disabled && "bg-gray-100 cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function KGSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  className
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-gray-600">{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border-2 border-[#00C600] rounded-lg text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[#00C600]/30",
          "bg-white",
          disabled && "bg-gray-100 cursor-not-allowed",
          className
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}