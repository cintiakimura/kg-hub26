import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGLogo from '@/components/ui/KGLogo';
import KGButton from '@/components/ui/KGButton';
import KGInput from '@/components/ui/KGInput';
import KGCard from '@/components/ui/KGCard';
import { Shield, Loader2 } from 'lucide-react';

export default function ManagerLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  
  const [form, setForm] = useState({
    display_name: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    const userData = await base44.auth.me();
    setUser(userData);
    
    const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
    if (profiles.length > 0 && profiles[0].role === 'manager') {
      navigate(createPageUrl('ManagerDashboard'));
    } else {
      setShowSetup(true);
      setForm({ display_name: userData.full_name || '' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Check if MGR org exists, if not create it
    const mgrOrgs = await base44.entities.Organisation.filter({ org_type: 'manager' });
    let orgId = 'MGR-001';
    
    if (mgrOrgs.length === 0) {
      await base44.entities.Organisation.create({
        org_id: orgId,
        org_type: 'manager',
        name: 'KG Hub Management'
      });
    } else {
      orgId = mgrOrgs[0].org_id;
    }
    
    await base44.entities.UserProfile.create({
      user_email: user.email,
      org_id: orgId,
      role: 'manager',
      display_name: form.display_name || user.full_name
    });
    
    navigate(createPageUrl('ManagerDashboard'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <KGLogo size={40} />
          <span className="text-xl text-gray-800">KG Hub – Manager Portal</span>
        </div>

        {showSetup && (
          <KGCard>
            <div className="flex items-center gap-2 mb-6">
              <Shield size={20} className="text-[#00C600]" />
              <span className="text-lg">Manager Profile Setup</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <KGInput
                label="Display Name"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="Your name"
              />

              <div className="pt-4">
                <KGButton type="submit" className="w-full">
                  Enter Dashboard
                </KGButton>
              </div>
            </form>
          </KGCard>
        )}
      </div>
    </div>
  );
}