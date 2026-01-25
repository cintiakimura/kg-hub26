import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AppHeader from '@/components/layout/AppHeader';
import SideNav from '@/components/layout/SideNav';
import KGCard from '@/components/ui/KGCard';
import KGBadge from '@/components/ui/KGBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KGSelect } from '@/components/ui/KGInput';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, Package, ExternalLink, ChevronRight 
} from 'lucide-react';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [clients, setClients] = useState({});
  const [suppliers, setSuppliers] = useState({});

  const navItems = [
    { page: 'ManagerDashboard', label: 'Production Control', icon: LayoutDashboard },
    { page: 'ManagerClients', label: 'Clients', icon: Users },
    { page: 'ManagerSalesQuotes', label: 'Sales Quotes', icon: FileText },
    { page: 'ManagerSupplierQuotes', label: 'Supplier Quotes', icon: Scale },
    { page: 'ManagerLogistics', label: 'Logistics', icon: Truck },
    { page: 'ManagerPurchases', label: 'Purchases', icon: ShoppingCart },
    { page: 'ManagerFinancials', label: 'Financials', icon: DollarSign }
  ];

  const columns = [
    { status: 'ordered', label: 'Ordered', color: 'bg-purple-100' },
    { status: 'in_production', label: 'In Production', color: 'bg-orange-100' },
    { status: 'dispatched', label: 'Dispatched', color: 'bg-cyan-100' },
    { status: 'in_transit', label: 'In Transit', color: 'bg-indigo-100' },
    { status: 'delayed', label: 'Delayed', color: 'bg-red-100' },
    { status: 'delivered', label: 'Delivered', color: 'bg-green-100' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      navigate(createPageUrl('ManagerLogin'));
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
    if (!profiles.length || profiles[0].role !== 'manager') {
      navigate(createPageUrl('ManagerLogin'));
      return;
    }
    setProfile(profiles[0]);

    // Load all POs
    const pos = await base44.entities.PurchaseOrder.list();
    setPurchaseOrders(pos);

    // Load orgs for lookup
    const orgs = await base44.entities.Organisation.list();
    const clientMap = {};
    const supplierMap = {};
    orgs.forEach(o => {
      if (o.org_type === 'client') clientMap[o.org_id] = o;
      if (o.org_type === 'supplier') supplierMap[o.org_id] = o;
    });
    setClients(clientMap);
    setSuppliers(supplierMap);

    setLoading(false);
  };

  const handleLogout = () => base44.auth.logout(createPageUrl('ManagerLogin'));

  const updatePOStatus = async (newStatus) => {
    if (!selectedPO) return;
    await base44.entities.PurchaseOrder.update(selectedPO.id, { status: newStatus });
    setSelectedPO(null);
    loadData();
  };

  const getColumnOrders = (status) => {
    return purchaseOrders
      .filter(po => po.status === status)
      .sort((a, b) => new Date(a.eta || a.created_date) - new Date(b.eta || b.created_date));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} orgId={profile?.org_id} onLogout={handleLogout} title="KG Hub – Manager" />
      
      <div className="flex">
        <SideNav items={navItems} currentPage="ManagerDashboard" />
        
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-gray-800">Production Control</h1>
          </div>

          {/* Kanban Board */}
          <div className="flex gap-4 min-w-max pb-4">
            {columns.map((col) => {
              const orders = getColumnOrders(col.status);
              return (
                <div key={col.status} className="w-64 flex-shrink-0">
                  <div className={`${col.color} rounded-t-lg px-3 py-2 border-2 border-b-0 border-[#00C600]`}>
                    <span className="text-sm text-gray-700">{col.label}</span>
                    <span className="ml-2 text-xs text-gray-500">({orders.length})</span>
                  </div>
                  <div className="border-2 border-t-0 border-[#00C600] rounded-b-lg bg-white min-h-[400px] p-2 space-y-2">
                    {orders.map((po) => (
                      <KGCard 
                        key={po.id}
                        onClick={() => setSelectedPO(po)}
                        className="!p-3 cursor-pointer hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[#00C600] text-xs">{po.po_id}</span>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-1">
                          {clients[po.client_org_id]?.name || po.client_org_id}
                        </p>
                        
                        <p className="text-sm truncate">
                          {po.items?.[0]?.description || 'Parts Order'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>${po.total_cost?.toFixed(2) || '0.00'}</span>
                          {po.eta && <span>ETA: {new Date(po.eta).toLocaleDateString()}</span>}
                        </div>

                        {po.tracking_number_outbound && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-[#00C600]">
                            <Truck size={12} />
                            <span>{po.tracking_number_outbound}</span>
                          </div>
                        )}
                      </KGCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* PO Detail Modal */}
      <Dialog open={!!selectedPO} onOpenChange={() => setSelectedPO(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {selectedPO?.po_id}</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Client:</span>
                  <p>{clients[selectedPO.client_org_id]?.name || selectedPO.client_org_id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Supplier:</span>
                  <p>{suppliers[selectedPO.supplier_org_id]?.name || selectedPO.supplier_org_id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Order Date:</span>
                  <p>{new Date(selectedPO.order_date || selectedPO.created_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">ETA:</span>
                  <p>{selectedPO.eta ? new Date(selectedPO.eta).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Cost:</span>
                  <p className="text-lg text-[#00C600]">${selectedPO.total_cost?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Parts Ready:</span>
                  <p>{selectedPO.parts_ready ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {selectedPO.tracking_number_inbound && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Inbound Tracking (Supplier → KG):</p>
                  <a 
                    href={`https://www.fedex.com/fedextrack/?trknbr=${selectedPO.tracking_number_inbound}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00C600] flex items-center gap-1"
                  >
                    {selectedPO.tracking_number_inbound}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {selectedPO.tracking_number_outbound && (
                <div className="bg-[#00C600]/5 border border-[#00C600] p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Outbound Tracking (KG → Client):</p>
                  <a 
                    href={`https://www.fedex.com/fedextrack/?trknbr=${selectedPO.tracking_number_outbound}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00C600] flex items-center gap-1"
                  >
                    {selectedPO.tracking_number_outbound}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-normal text-gray-600">Item</th>
                      <th className="text-right p-3 font-normal text-gray-600">Qty</th>
                      <th className="text-right p-3 font-normal text-gray-600">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.items?.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">${item.unit_price?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <KGSelect
                label="Update Status"
                value={selectedPO.status}
                onChange={(e) => updatePOStatus(e.target.value)}
                options={columns.map(c => ({ value: c.status, label: c.label }))}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}