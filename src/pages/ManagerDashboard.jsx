import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState([]);
  const [clients, setClients] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const profile = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    
    if (!profile || profile.role !== 'manager') {
      navigate(createPageUrl('ManagerLogin'));
      return;
    }

    const posData = await base44.entities.PurchaseOrder.list();
    setPos(posData);

    const clientsData = await base44.entities.Organisation.filter({ org_type: 'client' });
    const clientsMap = {};
    clientsData.forEach(c => clientsMap[c.org_id] = c.name);
    setClients(clientsMap);

    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.PurchaseOrder.update(id, { status });
    loadData();
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const columns = ['ordered', 'in_production', 'dispatched', 'in_transit', 'delayed', 'delivered'];

  return (
    <div className="p-8">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
        alt="KG Logo"
        style={{ height: 38 }}
        className="mb-8"
      />
      
      <TableExport data={pos} filename="production-control" />

      <h2 className="text-lg mb-4">Production Control</h2>
      
      <div className="grid grid-cols-6 gap-4">
        {columns.map(col => (
          <div key={col} className="border border-[#00c600] p-2">
            <h3 className="text-sm mb-2 capitalize">{col.replace('_', ' ')}</h3>
            {pos.filter(p => p.status === col).map(p => (
              <div key={p.id} className="border border-[#00c600] p-2 mb-2 text-xs">
                <div>{p.order_date}</div>
                <div>ETA: {p.eta}</div>
                <div>{clients[p.client_org_id]}</div>
                <div>{p.items?.length || 0} items</div>
                <div>${p.total_cost}</div>
                <div>{p.tracking_number_outbound}</div>
                <select
                  value={p.status}
                  onChange={(e) => updateStatus(p.id, e.target.value)}
                  className="w-full mt-1"
                >
                  {columns.map(c => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}