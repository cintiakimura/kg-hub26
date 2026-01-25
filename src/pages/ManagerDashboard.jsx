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

  const menuCards = [
    { 
      icon: '🏭', 
      name: 'Production Control', 
      desc: 'Manage orders, production and logistics', 
      page: 'ManagerDashboard',
      color: 'border-purple-500'
    },
    { 
      icon: '👥', 
      name: 'Clients', 
      desc: 'View all registered clients', 
      page: 'ManagerClients',
      color: 'border-green-500'
    },
    { 
      icon: '📋', 
      name: 'Quotations / Sales', 
      desc: 'Manage sales quotes and invoices', 
      page: 'ManagerSalesQuotes',
      color: 'border-blue-500'
    },
    { 
      icon: '📄', 
      name: 'Supplier Quotes', 
      desc: 'Review quotes from suppliers', 
      page: 'ManagerSupplierQuotes',
      color: 'border-pink-500'
    },
    { 
      icon: '🛒', 
      name: 'Purchases', 
      desc: 'Manage supplier orders', 
      page: 'ManagerPurchases',
      color: 'border-green-500'
    },
    { 
      icon: '🚚', 
      name: 'Logistics', 
      desc: 'Track deliveries', 
      page: 'ManagerLogistics',
      color: 'border-green-500'
    },
    { 
      icon: '📊', 
      name: 'Financials', 
      desc: 'Analyze costs and income', 
      page: 'ManagerFinancials',
      color: 'border-green-500'
    }
  ];

  return (
    <div className="p-6 bg-[#212121] min-h-screen">
      <h1 className="text-2xl mb-6 text-[#00c600]">Production Control</h1>
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="border border-[#00c600] rounded p-6">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Product</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Tracking</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pos.map(po => (
                <tr key={po.id}>
                  <td>{po.order_date}</td>
                  <td>{clients[po.client_org_id]}</td>
                  <td>{po.items?.[0]?.description || '-'}</td>
                  <td>${po.total_cost}</td>
                  <td>{po.status}</td>
                  <td>{po.tracking_number_inbound || '-'}</td>
                  <td><button>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}