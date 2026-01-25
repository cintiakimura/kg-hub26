import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function SupplierLogin() {
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
  const [form, setForm] = useState({
    name: '',
    vat: '',
    billing_address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: ''
  });
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

    if (profiles.length > 0) {
      navigate(createPageUrl('SupplierDashboard'));
    } else {
      setSetup(true);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = await base44.auth.me();
    const orgs = await base44.entities.Organisation.filter({ org_type: 'supplier' });
    const nextId = `SUP-${String(orgs.length + 1).padStart(3, '0')}`;

    await base44.entities.Organisation.create({
      org_id: nextId,
      org_type: 'supplier',
      ...form
    });

    await base44.entities.UserProfile.create({
      user_email: user.email,
      org_id: nextId,
      role: 'supplier',
      display_name: user.full_name
    });

    navigate(createPageUrl('SupplierDashboard'));
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border border-[#00c600] p-8 rounded">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
          alt="KG Logo"
          style={{ height: 38 }}
          className="mb-8"
        />
        <h1 className="text-xl mb-6">Supplier Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Company Name"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            required
          />
          <input
            placeholder="VAT Number"
            value={form.vat}
            onChange={(e) => setForm({...form, vat: e.target.value})}
          />
          <textarea
            placeholder="Address"
            value={form.billing_address}
            onChange={(e) => setForm({...form, billing_address: e.target.value})}
            rows={2}
          />
          <input
            placeholder="Contact Name"
            value={form.contact_name}
            onChange={(e) => setForm({...form, contact_name: e.target.value})}
          />
          <input
            placeholder="Contact Email"
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({...form, contact_email: e.target.value})}
          />
          <input
            placeholder="Contact Phone"
            value={form.contact_phone}
            onChange={(e) => setForm({...form, contact_phone: e.target.value})}
          />
          
          <button type="submit" className="w-full">Save</button>
        </form>
      </div>
    </div>
  );
}