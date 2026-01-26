import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, FileText, Package, TruckIcon, Plus, Upload, Settings, Building, DollarSign, ShoppingCart, Truck, Box, Car } from 'lucide-react';

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
  const [suppliers, setSuppliers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddQuotationModal, setShowAddQuotationModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [newProduction, setNewProduction] = useState({
    order_date: '',
    client_org_id: '',
    product: '',
    total_cost: '',
    status: 'ordered',
    tracking_number_inbound: '',
    eta: '',
    notes: ''
  });
  const [newClient, setNewClient] = useState({
    name: '',
    vat_number: '',
    billing_contact: '',
    delivery_contact: '',
    billing_address: '',
    delivery_address: '',
    contact_email: '',
    contact_phone: ''
  });
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    vat_number: '',
    billing_contact: '',
    delivery_contact: '',
    billing_address: '',
    delivery_address: '',
    contact_email: '',
    contact_phone: ''
  });
  const [newQuotation, setNewQuotation] = useState({
    client_org_id: '',
    vehicle_id: '',
    price: '',
    date: '',
    status: 'pending'
  });
  const [selectedQuote, setSelectedQuote] = useState(null);
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
    
    setUserProfile(profile);

    const posData = await base44.entities.PurchaseOrder.list();
    setPos(posData);

    const clientsData = await base44.entities.Organisation.filter({ org_type: 'client' });
    const clientsMap = {};
    clientsData.forEach(c => clientsMap[c.org_id] = c.name);
    setClients(clientsMap);

    const supplierData = await base44.entities.Organisation.filter({ org_type: 'supplier' });
    setSuppliers(supplierData);

    const quoteData = await base44.entities.SupplierQuote.list();
    setQuotes(quoteData);

    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.PurchaseOrder.update(id, { status });
    loadData();
  };

  const saveProduction = async () => {
    await base44.entities.PurchaseOrder.create({
      po_id: `Q-${Date.now()}-S-${Math.floor(Math.random() * 1000)}`,
      order_date: newProduction.order_date,
      client_org_id: newProduction.client_org_id,
      supplier_org_id: suppliers[0]?.org_id || 'SUP-001',
      status: newProduction.status,
      items: [{ description: newProduction.product, quantity: 1, unit_price: newProduction.total_cost }],
      total_cost: parseFloat(newProduction.total_cost) || 0,
      tracking_number_inbound: newProduction.tracking_number_inbound,
      eta: newProduction.eta,
      notes: newProduction.notes
    });
    toast.success('Production entry added');
    setNewProduction({ order_date: '', client_org_id: '', product: '', total_cost: '', status: 'ordered', tracking_number_inbound: '', eta: '', notes: '' });
    setShowProductionModal(false);
    loadData();
  };

  const importQuote = async () => {
    if (!selectedQuote) return;
    const quote = quotes.find(q => q.supplier_quote_id === selectedQuote);
    if (quote) {
      await base44.entities.PurchaseOrder.create({
        po_id: quote.sales_quote_id,
        order_date: quote.quote_date || new Date().toISOString().split('T')[0],
        client_org_id: 'C-001',
        supplier_org_id: quote.supplier_org_id,
        status: 'ordered',
        items: quote.items || [],
        total_cost: quote.price || 0
      });
      setSelectedQuote(null);
      setShowImportModal(false);
      loadData();
    }
  };

  const saveClient = async () => {
    const orgId = `C-${Date.now()}`;
    await base44.entities.Organisation.create({
      org_id: orgId,
      org_type: 'client',
      name: newClient.name,
      vat_number: newClient.vat_number,
      billing_address: newClient.billing_address,
      delivery_address: newClient.delivery_address,
      contact_name: newClient.billing_contact,
      contact_email: newClient.contact_email,
      contact_phone: newClient.contact_phone
    });
    toast.success('Client added');
    setShowAddClientModal(false);
    setNewClient({ name: '', vat_number: '', billing_contact: '', delivery_contact: '', billing_address: '', delivery_address: '', contact_email: '', contact_phone: '' });
    loadData();
  };

  const saveSupplier = async () => {
    const orgId = `SUP-${Date.now()}`;
    await base44.entities.Organisation.create({
      org_id: orgId,
      org_type: 'supplier',
      name: newSupplier.name,
      vat_number: newSupplier.vat_number,
      billing_address: newSupplier.billing_address,
      delivery_address: newSupplier.delivery_address,
      contact_name: newSupplier.billing_contact,
      contact_email: newSupplier.contact_email,
      contact_phone: newSupplier.contact_phone
    });
    toast.success('Supplier added');
    setShowAddSupplierModal(false);
    setNewSupplier({ name: '', vat_number: '', billing_contact: '', delivery_contact: '', billing_address: '', delivery_address: '', contact_email: '', contact_phone: '' });
    loadData();
  };

  const saveQuotation = async () => {
    const quoteId = `Q-${Date.now()}`;
    await base44.entities.SalesQuote.create({
      quote_id: quoteId,
      client_org_id: newQuotation.client_org_id,
      vehicle_id: newQuotation.vehicle_id,
      status: newQuotation.status,
      items: [],
      subtotal: parseFloat(newQuotation.price) || 0,
      shipping_cost: 0,
      total: parseFloat(newQuotation.price) || 0
    });
    toast.success('Quotation added');
    setShowAddQuotationModal(false);
    setNewQuotation({ client_org_id: '', vehicle_id: '', price: '', date: '', status: 'pending' });
    loadData();
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const columns = ['ordered', 'in_production', 'dispatched', 'in_transit', 'delayed', 'delivered'];

  const menuCards = [
    { icon: Settings, name: 'New Production', desc: 'Order a new build', action: () => setShowProductionModal(true) },
    { icon: Building, name: 'New Client', desc: 'Add customer', action: () => setShowAddClientModal(true) },
    { icon: FileText, name: 'New Quotation', desc: 'Send quote', action: () => setShowAddQuotationModal(true) },
    { icon: Package, name: 'New Supplier', desc: 'Add supplier', action: () => setShowAddSupplierModal(true) },
    { icon: ShoppingCart, name: 'New Purchase', desc: 'Place order', action: () => navigate(createPageUrl('ManagerPurchases')) },
    { icon: Truck, name: 'New Logistics', desc: 'Ship or receive', action: () => navigate(createPageUrl('ManagerLogistics')) },
    { icon: Box, name: 'New Product', desc: 'Add product', action: () => {} },
    { icon: Car, name: 'New Vehicle', desc: 'Add vehicle', action: () => {} },
    { icon: DollarSign, name: 'Financials', desc: 'View payments', action: () => navigate(createPageUrl('ManagerFinancials')) },
  ];

  return (
    <div className="bg-[#212121] min-h-screen">
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 220px);
          gap: 20px 30px;
          justify-content: center;
        }
        
        .dashboard-card {
          width: 220px;
          height: 120px;
          background: #212121;
          border: 1px solid #00c600;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: none;
        }
        
        .dashboard-card:hover {
          border-width: 2px;
          box-shadow: 0 0 8px #00c600;
          transform: scale(1.02);
        }
        
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-card {
            width: 100%;
          }
        }
        
        @media print {
          body, .bg-\\[\\#212121\\] {
            background: white !important;
          }
          .dashboard-card {
            background: white !important;
            border-color: black !important;
          }
          .dashboard-card h3, .dashboard-card p, .dashboard-card svg {
            color: black !important;
          }
        }
      `}</style>
      <div className="p-6 ml-16">
        <div className="flex justify-between items-center mb-8">
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '400' }}>Manager Dashboard</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <TableExport data={pos} filename="dashboard.csv" />
          </div>
        </div>
        <div className="dashboard-grid">
          {menuCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <button key={i} onClick={card.action} className="dashboard-card">
                <Icon size={20} style={{ color: '#00c600', marginBottom: '12px' }} />
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '400', margin: '0 0 4px 0' }}>{card.name}</h3>
                <p style={{ color: '#aaa', fontSize: '14px', fontWeight: '400', margin: '0' }}>{card.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Add Production Modal */}
        <Dialog open={showProductionModal} onOpenChange={setShowProductionModal}>
          <DialogContent className="max-w-[400px] bg-[#212121] border border-[#00c600]">
            <DialogHeader>
              <DialogTitle className="text-white">Add Production Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <Input type="date" placeholder="dd/mm/yyyy" value={newProduction.order_date} onChange={(e) => setNewProduction({ ...newProduction, order_date: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <select value={newProduction.client_org_id} onChange={(e) => setNewProduction({ ...newProduction, client_org_id: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm">
                <option value="">Select Client</option>
                {Object.entries(clients).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              <Input type="text" placeholder="e.g. 3 connectors + 1 KG Box" value={newProduction.product} onChange={(e) => setNewProduction({ ...newProduction, product: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input type="number" placeholder="Total cost" value={newProduction.total_cost} onChange={(e) => setNewProduction({ ...newProduction, total_cost: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <select value={newProduction.status} onChange={(e) => setNewProduction({ ...newProduction, status: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm">
                <option value="ordered">Ordered</option>
                <option value="in_production">In Production</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delayed">Delayed</option>
                <option value="delivered">Delivered</option>
              </select>
              <Input type="text" placeholder="FedEx tracking" value={newProduction.tracking_number_inbound} onChange={(e) => setNewProduction({ ...newProduction, tracking_number_inbound: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input type="date" placeholder="dd/mm/yyyy" value={newProduction.eta} onChange={(e) => setNewProduction({ ...newProduction, eta: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <textarea placeholder="Any notes" value={newProduction.notes} onChange={(e) => setNewProduction({ ...newProduction, notes: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm" rows="3"></textarea>
              <div className="flex gap-2 pt-2 border-t border-[#00c600]">
                <Button onClick={() => setShowProductionModal(false)} variant="outline" className="flex-1 border-[#00c600] text-gray-400">Cancel</Button>
                <Button onClick={saveProduction} className="flex-1 bg-[#00c600] text-white">Save Production</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Supplier Quote Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-md bg-[#212121] border border-[#00c600]">
            <DialogHeader>
              <DialogTitle className="text-white">Import from Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <select value={selectedQuote || ''} onChange={(e) => setSelectedQuote(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #00c600', background: '#2a2a2a', color: 'white' }}>
                <option value="">Select Supplier Quote</option>
                {quotes.map(q => <option key={q.id} value={q.supplier_quote_id}>{q.supplier_quote_id} - ${q.price}</option>)}
              </select>
              <div className="flex gap-2">
                <Button onClick={() => setShowImportModal(false)} variant="outline" className="flex-1">Cancel</Button>
                <Button onClick={importQuote} className="flex-1 bg-[#00c600] text-white">Import Quote</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Client Modal */}
        <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
          <DialogContent className="max-w-[400px] bg-[#212121] border border-[#00c600]">
            <DialogHeader>
              <DialogTitle className="text-white">Add Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <Input placeholder="e.g. Georg SAS" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. FR123456789" value={newClient.vat_number} onChange={(e) => setNewClient({ ...newClient, vat_number: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. contact@georgsas.fr" value={newClient.contact_email} onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. +33123456789" value={newClient.contact_phone} onChange={(e) => setNewClient({ ...newClient, contact_phone: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. Jean Dupont" value={newClient.billing_contact} onChange={(e) => setNewClient({ ...newClient, billing_contact: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. billing@georgsas.fr" value={newClient.billing_contact_email || ''} onChange={(e) => setNewClient({ ...newClient, billing_contact_email: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. +33123456789" value={newClient.billing_contact_phone || ''} onChange={(e) => setNewClient({ ...newClient, billing_contact_phone: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <textarea placeholder="e.g. 37 Av. Paul, 75008 Paris" value={newClient.billing_address} onChange={(e) => setNewClient({ ...newClient, billing_address: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm" rows="2"></textarea>
              <Input placeholder="e.g. Marie Curie" value={newClient.delivery_contact} onChange={(e) => setNewClient({ ...newClient, delivery_contact: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. delivery@georgsas.fr" value={newClient.delivery_contact_email || ''} onChange={(e) => setNewClient({ ...newClient, delivery_contact_email: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. +33123456789" value={newClient.delivery_contact_phone || ''} onChange={(e) => setNewClient({ ...newClient, delivery_contact_phone: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <textarea placeholder="e.g. 12 Rue de Marseille, 13001 Marseille" value={newClient.delivery_address} onChange={(e) => setNewClient({ ...newClient, delivery_address: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm" rows="2"></textarea>
              <div className="flex gap-2 pt-2 border-t border-[#00c600]">
                <Button onClick={() => setShowAddClientModal(false)} variant="outline" className="flex-1 border-[#00c600] text-gray-400">Cancel</Button>
                <Button onClick={saveClient} className="flex-1 bg-[#00c600] text-white">Save Client</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Supplier Modal */}
        <Dialog open={showAddSupplierModal} onOpenChange={setShowAddSupplierModal}>
          <DialogContent className="max-w-[400px] bg-[#212121] border border-[#00c600]">
            <DialogHeader>
              <DialogTitle className="text-white">Add Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <Input placeholder="e.g. King Kong Parts" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. CN123456789" value={newSupplier.vat_number} onChange={(e) => setNewSupplier({ ...newSupplier, vat_number: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. contact@kingkong.cn" value={newSupplier.contact_email} onChange={(e) => setNewSupplier({ ...newSupplier, contact_email: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="e.g. +86123456789" value={newSupplier.contact_phone} onChange={(e) => setNewSupplier({ ...newSupplier, contact_phone: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <textarea placeholder="e.g. Shenzhen, China" value={newSupplier.billing_address} onChange={(e) => setNewSupplier({ ...newSupplier, billing_address: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm" rows="3"></textarea>
              <div className="flex gap-2 pt-2 border-t border-[#00c600]">
                <Button onClick={() => setShowAddSupplierModal(false)} variant="outline" className="flex-1 border-[#00c600] text-gray-400">Cancel</Button>
                <Button onClick={saveSupplier} className="flex-1 bg-[#00c600] text-white">Save Supplier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Quotation Modal */}
        <Dialog open={showAddQuotationModal} onOpenChange={setShowAddQuotationModal}>
          <DialogContent className="max-w-[400px] bg-[#212121] border border-[#00c600]">
            <DialogHeader>
              <DialogTitle className="text-white">Add Quotation</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <select value={newQuotation.client_org_id} onChange={(e) => setNewQuotation({ ...newQuotation, client_org_id: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm">
                <option value="">Select Client</option>
                {Object.entries(clients).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              <select value={newQuotation.vehicle_id} onChange={(e) => setNewQuotation({ ...newQuotation, vehicle_id: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm">
                <option value="">Select Vehicle</option>
              </select>
              <textarea placeholder="e.g. 3 connectors, 1 KG Box" value={newQuotation.items || ''} onChange={(e) => setNewQuotation({ ...newQuotation, items: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm" rows="2"></textarea>
              <Input placeholder="Total price" type="number" value={newQuotation.price} onChange={(e) => setNewQuotation({ ...newQuotation, price: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="VAT amount" type="number" value={newQuotation.tax || ''} onChange={(e) => setNewQuotation({ ...newQuotation, tax: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="Shipping cost" type="number" value={newQuotation.shipping || ''} onChange={(e) => setNewQuotation({ ...newQuotation, shipping: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <Input placeholder="dd/mm/yyyy" type="date" value={newQuotation.date} onChange={(e) => setNewQuotation({ ...newQuotation, date: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
              <select value={newQuotation.status} onChange={(e) => setNewQuotation({ ...newQuotation, status: e.target.value })} className="w-full p-2 bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm">
                <option value="pending">Draft</option>
                <option value="quoted">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Delayed</option>
              </select>
              <div className="flex gap-2 pt-2 border-t border-[#00c600]">
                <Button onClick={() => setShowAddQuotationModal(false)} variant="outline" className="flex-1 border-[#00c600] text-gray-400">Cancel</Button>
                <Button onClick={saveQuotation} className="flex-1 bg-[#00c600] text-white">Save Quotation</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
        </div>
        );
        }