import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        // Not authenticated - show client landing
        navigate(createPageUrl('ClientLoginLanding'));
        return;
      }

      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });

      if (profiles.length > 0) {
        const role = profiles[0].role;
        
        if (role === 'client') {
          navigate(createPageUrl('ClientDashboard'));
        } else if (role === 'supplier') {
          navigate(createPageUrl('SupplierDashboard'));
        } else if (role === 'manager') {
          navigate(createPageUrl('ManagerDashboard'));
        } else {
          navigate(createPageUrl('ClientLoginLanding'));
        }
      } else {
        // No profile - redirect to client landing
        navigate(createPageUrl('ClientLoginLanding'));
      }
    } catch (err) {
      navigate(createPageUrl('ClientLoginLanding'));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#212121]">
      <div className="text-white">Loading...</div>
    </div>
  );
}