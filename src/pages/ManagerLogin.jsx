import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function ManagerLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        navigate(createPageUrl('ManagerDashboard'));
      }
    };
    checkAuth();
  }, [navigate]);

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
        <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#00c600' }}>Manager Dashboard</h1>
        <p style={{ fontSize: '16px', marginBottom: '40px', opacity: 0.8 }}>
          Production, delays, clients, funding – under control.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              background: '#00c600',
              color: '#000',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Log in
          </button>
          <button 
            onClick={() => window.location.href = '/signup'}
            style={{
              background: '#000',
              color: '#00c600',
              padding: '10px 20px',
              border: '1px solid #00c600',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}