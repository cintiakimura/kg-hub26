import React from 'react';
import { Download } from 'lucide-react';

export default function TableExport({ data, filename = 'export' }) {
  const exportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h] || '';
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportCSV}
      className="fixed top-4 right-16 z-50 border border-[#00c600] px-3 py-2 rounded flex items-center gap-2"
    >
      <Download size={16} color="#00c600" />
      <span className="text-sm">CSV</span>
    </button>
  );
}