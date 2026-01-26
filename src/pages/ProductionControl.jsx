import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Upload } from 'lucide-react';

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
`;

export default function ProductionControl() {
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState([]);
  const [clients, setClients] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="bg-[#212121] min-h-screen">
      <style>{tableStyles}</style>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-[#00c600]">Production Control</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowProductionModal(true)} className="bg-[#00c600] text-white border border-[#00c600]">
              <Plus size={16} className="mr-1" /> Production
            </Button>
            <Button onClick={() => setShowImportModal(true)} className="bg-[#00c600] text-white border border-[#00c600]">
              <Upload size={16} className="mr-1" /> Import
            </Button>
            <TableExport data={pos} filename="production_control.csv" />
          </div>
        </div>
        
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
      </div>
    </div>
  );
}