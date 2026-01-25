import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
          alt="KG Logo"
          style={{ height: 60 }}
          className="mx-auto mb-8"
        />
        <h1 className="text-2xl mb-8">KG Hub</h1>
        <div className="space-y-4">
          <Link to={createPageUrl('ClientLogin')}>
            <button className="w-48">Client Portal</button>
          </Link>
          <br />
          <Link to={createPageUrl('SupplierLogin')}>
            <button className="w-48">Supplier Portal</button>
          </Link>
          <br />
          <Link to={createPageUrl('ManagerLogin')}>
            <button className="w-48">Manager Portal</button>
          </Link>
        </div>
      </div>
    </div>
  );
}