import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';

export default function ClientOrganisationDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get('org_id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      const profileData = profiles[0];

      if (!profileData) {
        navigate(createPageUrl('ClientLogin'));
        return;
      }

      setProfile(profileData);

      const orgs = await base44.entities.Organisation.filter({ org_id: profileData.org_id });
      if (orgs.length > 0) {
        setOrg(orgs[0]);
      }

      const vehiclesData = await base44.entities.Vehicle.filter({ org_id: profileData.org_id });
      setVehicles(vehiclesData);

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Organisation not found
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(createPageUrl('ClientDashboard'))}
          className="p-2 hover:bg-[#00c600] hover:bg-opacity-20 rounded transition-all"
        >
          <ArrowLeft size={20} color="#00c600" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 size={24} className="text-[#00C600]" />
          <h1 className="text-xl text-[#00c600]">Organisation Detail - {org.org_id}</h1>
        </div>
      </div>

      {/* Organisation Info Card */}
      <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#00c600]">
        <h2 className="text-[#00c600] text-lg mb-4 font-normal">ORGANISATION INFORMATION</h2>
        <table>
          <tbody>
            <tr>
              <td className="font-normal text-gray-500 pb-3">Name</td>
              <td className="pb-3">{org.name || '-'}</td>
            </tr>
            <tr>
              <td className="font-normal text-gray-500 pb-3">Organisation ID</td>
              <td className="pb-3">{org.org_id || '-'}</td>
            </tr>
            <tr>
              <td className="font-normal text-gray-500 pb-3">VAT Number</td>
              <td className="pb-3">{org.vat_number || '-'}</td>
            </tr>
            <tr>
              <td className="font-normal text-gray-500 pb-3">Contact Name</td>
              <td className="pb-3">{org.contact_name || '-'}</td>
            </tr>
            <tr>
              <td className="font-normal text-gray-500 pb-3">Contact Email</td>
              <td className="pb-3">{org.contact_email || '-'}</td>
            </tr>
            <tr>
              <td className="font-normal text-gray-500 pb-3">Contact Phone</td>
              <td className="pb-3">{org.contact_phone || '-'}</td>
            </tr>
            <tr>
              <td className="font-normal text-gray-500 pb-3">Billing Address</td>
              <td className="pb-3">{org.billing_address || '-'}</td>
            </tr>
            <tr>
              <td className="font-normal text-gray-500">Delivery Address</td>
              <td>{org.delivery_address || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Vehicles */}
      <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600]">
        <h2 className="text-[#00c600] text-lg mb-4 font-normal">VEHICLES</h2>
        {vehicles.length === 0 ? (
          <p className="text-gray-500 text-sm">No vehicles found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>VIN</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr 
                  key={v.id} 
                  onClick={() => navigate(createPageUrl(`ClientVehicleDetail?id=${v.id}`))}
                  className="cursor-pointer"
                >
                  <td>{v.vehicle_id}</td>
                  <td>{v.make || '-'}</td>
                  <td>{v.model || '-'}</td>
                  <td>{v.year || '-'}</td>
                  <td>{v.vin || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}