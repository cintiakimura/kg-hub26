import React from 'react';

export default function KGLogo({ size = 40 }) {
  return (
    <img 
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
      alt="KG Logo"
      style={{ height: size }}
      className="object-contain"
    />
  );
}