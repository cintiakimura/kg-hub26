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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">
            📊
          </div>
          <div>
            <h1 className="text-2xl">Manager Dashboard</h1>
            <p className="text-sm opacity-70">Overview of all clients, companies, and fleets.</p>
          </div>
        </div>
        <button className="bg-[#00c600] px-4 py-2 rounded-lg flex items-center gap-2">
          <span>👤</span> Invite User
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {menuCards.map((card, index) => (
          <div
            key={card.page}
            onClick={() => navigate(createPageUrl(card.page))}
            className={`bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all border-2 ${card.color} flex flex-col items-center text-center`}
          >
            <div className="text-4xl mb-3">{card.icon}</div>
            <div className="text-base mb-1">{card.name}</div>
            <div className="text-xs opacity-70">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}