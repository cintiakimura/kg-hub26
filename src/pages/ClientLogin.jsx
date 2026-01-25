import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function ClientLogin() {
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
  const [form, setForm] = useState({
    name: '',
    vat: '',
    billing_address: '',
    delivery_address: '',
    contact_billing: '',
    contact_delivery: ''
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
      navigate(createPageUrl('ClientDashboard'));
    } else {
      setSetup(true);
      setLoading(false);
    }
  };

  const handleVATBlur = async () => {
    if (!form.vat || form.vat.length < 8) return;

    const isBR = /^\d{14}$/.test(form.vat.replace(/\D/g, ''));
    if (isBR) {
      try {
        const cnpj = form.vat.replace(/\D/g, '');
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        const data = await res.json();
        
        setForm(prev => ({
          ...prev,
          name: data.razao_social || data.nome_fantasia || prev.name,
          billing_address: `${data.logradouro || ''}, ${data.numero || ''}, ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}, ${data.cep || ''}`.trim(),
        }));
      } catch (err) {
        console.log('CNPJ lookup failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = await base44.auth.me();
    const orgs = await base44.entities.Organisation.filter({ org_type: 'client' });
    const nextId = `C-${String(orgs.length + 1).padStart(3, '0')}`;

    await base44.entities.Organisation.create({
      org_id: nextId,
      org_type: 'client',
      ...form
    });

    await base44.entities.UserProfile.create({
      user_email: user.email,
      org_id: nextId,
      role: 'client',
      display_name: user.full_name
    });

    navigate(createPageUrl('ClientDashboard'));
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
        <h1 className="text-xl mb-6">Create Organisation</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="VAT / CNPJ"
            value={form.vat}
            onChange={(e) => setForm({...form, vat: e.target.value})}
            onBlur={handleVATBlur}
            required
          />
          <input
            placeholder="Organisation Name"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            required
          />
          <textarea
            placeholder="Billing Address"
            value={form.billing_address}
            onChange={(e) => setForm({...form, billing_address: e.target.value})}
            rows={2}
          />
          <textarea
            placeholder="Delivery Address"
            value={form.delivery_address}
            onChange={(e) => setForm({...form, delivery_address: e.target.value})}
            rows={2}
          />
          <input
            placeholder="Billing Contact"
            value={form.contact_billing}
            onChange={(e) => setForm({...form, contact_billing: e.target.value})}
          />
          <input
            placeholder="Delivery Contact"
            value={form.contact_delivery}
            onChange={(e) => setForm({...form, contact_delivery: e.target.value})}
          />
          
          <button type="submit" className="w-full">Save</button>
        </form>
      </div>
    </div>
  );
}