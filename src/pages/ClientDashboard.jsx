import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';

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

  return (
    <div className="p-8">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
        alt="KG Logo"
        style={{ height: 38 }}
        className="mb-8"
      />
      
      <TableExport data={[org, ...vehicles, ...purchases]} filename="client-data" />

      <h2 className="text-lg mb-4">Organisation Info</h2>
      <table className="mb-8">
        <thead>
          <tr>
            <th>Organisation</th>
            <th>ID</th>
            <th>VAT</th>
            <th>Billing Address</th>
            <th>Delivery Address</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{org?.name}</td>
            <td>{org?.org_id}</td>
            <td>{org?.vat_number}</td>
            <td>{org?.billing_address}</td>
            <td>{org?.delivery_address}</td>
            <td>{org?.contact_billing}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg">Vehicles</h2>
        <button onClick={() => navigate(createPageUrl('ClientVehicleAdd'))}>Add Vehicle</button>
      </div>
      <table className="mb-8">
        <thead>
          <tr>
            <th>Brand</th>
            <th>Model</th>
            <th>Year</th>
            <th>VIN</th>
            <th>ID</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id} onClick={() => navigate(createPageUrl(`ClientVehicleDetail?id=${v.id}`))} className="cursor-pointer">
              <td>{v.make}</td>
              <td>{v.model}</td>
              <td>{v.year}</td>
              <td>{v.vin}</td>
              <td>{v.vehicle_id}</td>
              <td>View</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg mb-4">Purchases</h2>
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
              <td>{p.items?.length || 0} items</td>
              <td>{p.status}</td>
              <td>{p.tracking_number_outbound}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}