import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function SideNav({ items = [], currentPage }) {
  return (
    <nav className="w-56 bg-white border-r-2 border-[#00C600] min-h-screen p-4">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          
          return (
            <li key={item.page}>
              <Link
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-[#00C600]/10 text-[#00C600] border border-[#00C600]" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {Icon && <Icon size={18} />}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}