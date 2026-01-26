import React from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function ClientLoginLanding() {
  return (
    <div style={{
      background: '#212121',
      color: 'white',
      textAlign: 'center',
      padding: '100px 20px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '500px' }}>
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
          alt="KG Logo"
          style={{ width: '100px', marginBottom: '40px' }}
        />
        <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#00c600' }}>KG Hub</h1>
        <p style={{ fontSize: '16px', marginBottom: '40px', opacity: 0.8 }}>
          Track your vehicles, quotes, deliveries – all in one place.
        </p>
        <button 
          onClick={() => {
            base44.auth.redirectToLogin(createPageUrl('ClientDashboard'));
          }}
          style={{
            background: '#00c600',
            color: '#000',
            padding: '15px 40px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            borderRadius: '8px'
          }}
        >
          Log in as Client
        </button>
      </div>
    </div>
  );
}