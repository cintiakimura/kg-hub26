import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { Users, FileText, Package, TruckIcon } from 'lucide-react';

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

  const todayOrders = pos.filter(p => p.status === 'ordered');
  const inProduction = pos.filter(p => p.status === 'in_production');
  const ready = pos.filter(p => p.status === 'dispatched');

  const menuCards = [
    { icon: Users, name: 'Clients', desc: 'Manage client accounts', page: 'ManagerClients' },
    { icon: FileText, name: 'Sales Quotes', desc: 'Quote management', page: 'ManagerSalesQuotes' },
    { icon: Package, name: 'Supplier Quotes', desc: 'Supplier requests', page: 'ManagerSupplierQuotes' },
    { icon: TruckIcon, name: 'Logistics', desc: 'Shipment tracking', page: 'ManagerLogistics' }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {menuCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.page}
              onClick={() => navigate(createPageUrl(card.page))}
              className="bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all border border-[#00c600]"
            >
              <Icon size={24} color="#00c600" className="mb-2" />
              <div className="text-sm mb-1">{card.name}</div>
              <div className="text-xs opacity-70">{card.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-6 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c600" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <div>
            <div className="text-lg">Production Control</div>
            <div className="text-xs opacity-70">Keep the line moving</div>
          </div>
          <div className="ml-auto">
            <TableExport data={pos} filename="production-control" />
          </div>
        </div>

        <div className="border-t border-[#00c600] pt-4 mb-4">
          <div className="mb-2">Today's Orders</div>
          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Client</th>
                <th>Items</th>
                <th>Cost</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayOrders.map(p => (
                <tr key={p.id}>
                  <td>{p.po_id}</td>
                  <td>{clients[p.client_org_id]}</td>
                  <td>{p.items?.length || 0}</td>
                  <td>${p.total_cost}</td>
                  <td>{p.eta}</td>
                  <td>
                    <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}>
                      {columns.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#00c600] pt-4 mb-4">
          <div className="mb-2">In Production</div>
          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Client</th>
                <th>Items</th>
                <th>Cost</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inProduction.map(p => (
                <tr key={p.id}>
                  <td>{p.po_id}</td>
                  <td>{clients[p.client_org_id]}</td>
                  <td>{p.items?.length || 0}</td>
                  <td>${p.total_cost}</td>
                  <td>{p.eta}</td>
                  <td>
                    <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}>
                      {columns.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#00c600] pt-4">
          <div className="mb-2">Shipments Ready</div>
          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Client</th>
                <th>Items</th>
                <th>Cost</th>
                <th>Tracking</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ready.map(p => (
                <tr key={p.id}>
                  <td>{p.po_id}</td>
                  <td>{clients[p.client_org_id]}</td>
                  <td>{p.items?.length || 0}</td>
                  <td>${p.total_cost}</td>
                  <td>{p.tracking_number_outbound}</td>
                  <td>
                    <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}>
                      {columns.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}