import React from 'react';

export default function KGLogo({ size = 40 }) {
  return (
    <div 
      className="flex items-center justify-center border-2 border-[#00C600] rounded-lg bg-white"
      style={{ width: size, height: size }}
    >
      <span className="text-[#00C600] font-normal" style={{ fontSize: size * 0.4 }}>
        KG
      </span>
    </div>
  );
}