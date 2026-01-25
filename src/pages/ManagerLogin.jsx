import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function ManagerLogin() {
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    const user = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });

    if (profiles.length > 0 && profiles[0].role === 'manager') {
      navigate(createPageUrl('ManagerDashboard'));
    } else {
      setSetup(true);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = await base44.auth.me();
    
    const existing = await base44.entities.Organisation.filter({ org_type: 'manager' });
    let orgId = 'MGR-001';
    
    if (existing.length === 0) {
      await base44.entities.Organisation.create({
        org_id: orgId,
        org_type: 'manager',
        name: 'KG Hub Management'
      });
    }

    await base44.entities.UserProfile.create({
      user_email: user.email,
      org_id: orgId,
      role: 'manager',
      display_name: displayName
    });

    navigate(createPageUrl('ManagerDashboard'));
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-[#00c600] p-8 rounded">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
          alt="KG Logo"
          style={{ height: 38 }}
          className="mb-8"
        />
        <h1 className="text-xl mb-6">Manager Setup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <button type="submit" className="w-full">Continue</button>
        </form>
      </div>
    </div>
  );
}