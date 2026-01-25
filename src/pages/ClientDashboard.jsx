import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { FileText, TruckIcon, Car, Users, Building2, Phone, Mail, Calendar, Edit } from 'lucide-react';

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const profile = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    
    if (!profile) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }

    const orgData = (await base44.entities.Organisation.filter({ org_id: profile.org_id }))[0];
    setOrg(orgData);

    const vehiclesData = await base44.entities.Vehicle.filter({ org_id: profile.org_id });
    setVehicles(vehiclesData);

    const purchasesData = await base44.entities.PurchaseOrder.filter({ client_org_id: profile.org_id });
    setPurchases(purchasesData);

    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const menuCards = [
    { icon: FileText, name: 'Quotes', desc: 'Review quote requests', page: 'ClientQuotes' },
    { icon: TruckIcon, name: 'Shipments', desc: 'Track deliveries', page: 'ClientShipments' },
    { icon: Car, name: 'Vehicles', desc: 'Manage fleet details', page: 'ClientVehicleAdd' },
    { icon: Users, name: 'Organisation', desc: 'Company settings', page: 'ClientDashboard' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="text-2xl mb-1">DASHBOARD</div>
        <div className="text-sm opacity-70">Welcome back, {org?.contact_name}</div>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#00c600] relative">
        <button 
          onClick={() => navigate(createPageUrl('ClientDashboard'))}
          className="absolute top-4 right-4 p-2 hover:bg-[#00c600] hover:bg-opacity-20 rounded transition-all"
        >
          <Edit size={16} color="#00c600" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} color="#00c600" />
          <div className="text-xs opacity-70">COMPANY PROFILE</div>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded flex items-center justify-center border border-[#00c600]">
              <Building2 size={32} color="#00c600" />
            </div>
            <div>
              <div className="text-xl mb-1">{org?.name}</div>
              <div className="text-sm opacity-70">{org?.org_id}</div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 ml-8">
            <div className="flex items-center gap-2">
              <Phone size={14} color="#00c600" />
              <div className="text-sm">{org?.contact_phone || '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} color="#00c600" />
              <div className="text-sm">Member since {org?.created_date?.split('T')[0] || 'Jan 2026'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} color="#00c600" />
              <div className="text-sm">{org?.contact_email}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#00c600]">
        <div className="border-t border-[#00c600] pt-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>Your Vehicles</div>
            <button onClick={() => navigate(createPageUrl('ClientVehicleAdd'))}>Add Vehicle</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>VIN</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} onClick={() => navigate(createPageUrl(`ClientVehicleDetail?id=${v.id}`))}>
                  <td>{v.make}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td>{v.vin}</td>
                  <td>{v.vehicle_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#00c600] pt-4">
          <div className="mb-2">What You Bought</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>PO ID</th>
                <th>Items</th>
                <th>Status</th>
                <th>Tracking</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td>{p.order_date}</td>
                  <td>{p.po_id}</td>
                  <td>{p.items?.length || 0}</td>
                  <td>{p.status}</td>
                  <td>{p.tracking_number_outbound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}