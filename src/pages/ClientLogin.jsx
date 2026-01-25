import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function ClientLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      navigate(createPageUrl('ClientDashboard'));
    };
    auth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#1a1a1a]">
      <div className="border border-[#00c600] rounded p-8">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
          alt="KG Logo"
          className="w-12 h-12 mb-4"
        />
        <p className="text-[#00c600]">Redirecting...</p>
      </div>
    </div>
  );
}