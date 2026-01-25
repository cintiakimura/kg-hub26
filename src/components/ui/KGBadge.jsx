import React from 'react';
import { cn } from '@/lib/utils';

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  quoted: "bg-blue-100 text-blue-800 border-blue-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  completed: "bg-gray-100 text-gray-800 border-gray-300",
  ordered: "bg-purple-100 text-purple-800 border-purple-300",
  in_production: "bg-orange-100 text-orange-800 border-orange-300",
  dispatched: "bg-cyan-100 text-cyan-800 border-cyan-300",
  in_transit: "bg-indigo-100 text-indigo-800 border-indigo-300",
  delayed: "bg-red-100 text-red-800 border-red-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  requested: "bg-yellow-100 text-yellow-800 border-yellow-300",
  accepted: "bg-green-100 text-green-800 border-green-300",
  ready: "bg-green-100 text-green-800 border-green-300",
  default: "bg-gray-100 text-gray-800 border-gray-300"
};

export default function KGBadge({ status, className }) {
  const colorClass = statusColors[status?.toLowerCase()] || statusColors.default;
  
  return (
    <span className={cn(
      "px-2 py-0.5 text-xs rounded border font-normal",
      colorClass,
      className
    )}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}