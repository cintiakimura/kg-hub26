import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGLogo from '@/components/ui/KGLogo';
import KGButton from '@/components/ui/KGButton';
import KGInput, { KGTextarea } from '@/components/ui/KGInput';
import KGCard from '@/components/ui/KGCard';
import { Building2, Loader2 } from 'lucide-react';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [vatLoading, setVatLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    vat_number: '',
    billing_address: '',
    delivery_address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: ''
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
    
    // Check if user has profile
    const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
    if (profiles.length > 0 && profiles[0].org_id) {
      setProfile(profiles[0]);
      navigate(createPageUrl('ClientDashboard'));
    } else {
      setShowSetup(true);
    }
    setLoading(false);
  };

  const lookupVAT = async () => {
    if (!form.vat_number) return;
    setVatLoading(true);
    
    const vat = form.vat_number.replace(/\s/g, '').toUpperCase();
    
    // Try EU vatlayer or BR brasilapi
    if (/^[A-Z]{2}/.test(vat)) {
      // EU VAT
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Look up EU VAT number ${vat} and return company info`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            address: { type: "string" },
            valid: { type: "boolean" }
          }
        }
      });
      if (result.valid) {
        setForm(f => ({ ...f, name: result.name || f.name, billing_address: result.address || f.billing_address }));
      }
    } else if (/^\d{14}$/.test(vat)) {
      // Brazilian CNPJ
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Look up Brazilian CNPJ ${vat} and return company info`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            address: { type: "string" },
            valid: { type: "boolean" }
          }
        }
      });
      if (result.valid) {
        setForm(f => ({ ...f, name: result.name || f.name, billing_address: result.address || f.billing_address }));
      }
    }
    
    setVatLoading(false);
  };

  const generateOrgId = async () => {
    const orgs = await base44.entities.Organisation.filter({ org_type: 'client' });
    const num = orgs.length + 1;
    return `C-${String(num).padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const orgId = await generateOrgId();
    
    // Create organisation
    await base44.entities.Organisation.create({
      org_id: orgId,
      org_type: 'client',
      name: form.name,
      vat_number: form.vat_number,
      billing_address: form.billing_address,
      delivery_address: form.delivery_address,
      contact_name: form.contact_name,
      contact_email: form.contact_email || user.email,
      contact_phone: form.contact_phone
    });
    
    // Create user profile
    await base44.entities.UserProfile.create({
      user_email: user.email,
      org_id: orgId,
      role: 'client',
      display_name: form.contact_name || user.full_name
    });
    
    navigate(createPageUrl('ClientDashboard'));
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
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <KGLogo size={40} />
          <span className="text-xl text-gray-800">KG Hub – Client Portal</span>
        </div>

        {showSetup && (
          <KGCard>
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-[#00C600]" />
              <span className="text-lg">Create Organisation</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <KGInput
                    label="VAT / Tax ID"
                    value={form.vat_number}
                    onChange={(e) => setForm({ ...form, vat_number: e.target.value })}
                    placeholder="EU VAT or BR CNPJ"
                  />
                </div>
                <div className="flex items-end">
                  <KGButton 
                    type="button" 
                    variant="outline" 
                    onClick={lookupVAT}
                    disabled={vatLoading}
                  >
                    {vatLoading ? <Loader2 className="animate-spin" size={16} /> : 'Lookup'}
                  </KGButton>
                </div>
              </div>

              <KGInput
                label="Organisation Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Company name"
              />

              <KGTextarea
                label="Billing Address"
                value={form.billing_address}
                onChange={(e) => setForm({ ...form, billing_address: e.target.value })}
                placeholder="Full billing address"
              />

              <KGTextarea
                label="Delivery Address"
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                placeholder="Full delivery address (if different)"
              />

              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-3">Contact Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KGInput
                    label="Contact Name"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="Primary contact"
                  />
                  <KGInput
                    label="Contact Email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    placeholder={user?.email}
                  />
                  <KGInput
                    label="Contact Phone"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="pt-4">
                <KGButton type="submit" className="w-full">
                  Create Organisation
                </KGButton>
              </div>
            </form>
          </KGCard>
        )}
      </div>
    </div>
  );
}