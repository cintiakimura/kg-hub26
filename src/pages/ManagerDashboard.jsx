import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { Users, FileText, Package, TruckIcon } from 'lucide-react';

const tableStyles = `
  .excel-table {
    width: 100%;
    border-collapse: collapse;
    font-family: akkurat, sans-serif;
    font-size: 14px;
    font-weight: 400;
  }
  
  .excel-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #1e1e1e;
  }
  
  .excel-table th {
    border: 1px solid #00c600;
    padding: 12px;
    text-align: left;
    color: #00c600;
    font-weight: 400;
    background: #1e1e1e;
  }
  
  .excel-table td {
    border: 1px solid #00c600;
    padding: 12px;
    color: white;
  }
  
  .excel-table tbody tr:nth-child(odd) {
    background: #1e1e1e;
  }
  
  .excel-table tbody tr:nth-child(even) {
    background: #2a2a2a;
  }
  
  .excel-table tbody tr:hover {
    background: #004d00;
  }
  
  .excel-table button {
    background: #00c600;
    color: white;
    border: 1px solid #00c600;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 400;
  }
  
  .excel-table button:hover {
    opacity: 0.8;
  }
  
  @media print {
    .excel-table {
      color: black;
    }
    .excel-table th,
    .excel-table td {
      background: white !important;
      color: black !important;
      border-color: black !important;
    }
    .excel-table button {
      background: white;
      color: black;
      border-color: black;
    }
  }
`;

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
    <div className="bg-[#212121] min-h-screen">
      <style>{tableStyles}</style>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-[#00c600]">Production Control</h1>
          <TableExport data={pos} filename="production_control.csv" />
        </div>
        {loading && <div>Loading...</div>}
        {!loading && (
          <table className="excel-table">
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
        )}
      </div>
    </div>
  );
}