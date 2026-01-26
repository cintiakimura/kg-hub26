import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Upload, Edit2 } from 'lucide-react';

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [newProduction, setNewProduction] = useState({
    order_date: '',
    expected_delivery: '',
    client: '',
    product: '',
    supplier: '',
    cost: '',
    status: 'Ordered',
    tracking: ''
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

  const startEdit = (po) => {
    setEditingId(po.id);
    setEditingData({
      order_date: po.order_date || '',
      expected_delivery: po.eta || '',
      client: po.client_org_id || '',
      product: po.items?.[0]?.description || '',
      supplier: po.supplier_org_id || '',
      cost: po.total_cost || '',
      status: po.status || 'ordered',
      tracking: po.tracking_number_inbound || ''
    });
  };

  const saveEdit = async () => {
    await base44.entities.PurchaseOrder.update(editingId, {
      order_date: editingData.order_date,
      eta: editingData.expected_delivery,
      client_org_id: editingData.client,
      supplier_org_id: editingData.supplier,
      status: editingData.status,
      items: [{ description: editingData.product, quantity: 1, unit_price: editingData.cost }],
      total_cost: parseFloat(editingData.cost) || 0,
      tracking_number_inbound: editingData.tracking
    });
    toast.success('Saved');
    setEditingId(null);
    setEditingData(null);
    loadData();
  };

  const saveProduction = async () => {
    await base44.entities.PurchaseOrder.create({
      po_id: `PO-${Date.now()}`,
      order_date: newProduction.order_date,
      eta: newProduction.expected_delivery,
      client_org_id: clients[newProduction.client] || newProduction.client,
      supplier_org_id: newProduction.supplier,
      status: newProduction.status.toLowerCase().replace(' ', '_'),
      items: [{ description: newProduction.product, quantity: 1, unit_price: newProduction.cost }],
      total_cost: parseFloat(newProduction.cost) || 0,
      tracking_number_inbound: newProduction.tracking
    });
    toast.success('Saved');
    setNewProduction({ order_date: '', expected_delivery: '', client: '', product: '', supplier: '', cost: '', status: 'Ordered', tracking: '' });
    setEditingId(null);
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
    <div className="bg-[#212121] min-h-screen ml-16">
      <style>{tableStyles}</style>
      <div className="bg-[#212121] flex items-center justify-between px-6" style={{ height: '120px', width: '100%' }}>
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '400', marginLeft: '20px' }}>Production Control</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowImportModal(true)} className="bg-[#00c600] text-black border border-[#00c600]">
            Import from Supplier
          </Button>
        </div>
      </div>
      <div className="px-6 py-6" style={{ width: '100%' }}>
        <table className="excel-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Client</th>
              <th>Product</th>
              <th>Supplier</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Tracking</th>
              <th style={{ width: '50px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {editingId === 'new' && (
              <tr style={{ background: '#2a2a2a' }}>
                <td><input type="date" value={newProduction.order_date} onChange={(e) => setNewProduction({ ...newProduction, order_date: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                <td><input type="date" value={newProduction.expected_delivery} onChange={(e) => setNewProduction({ ...newProduction, expected_delivery: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                <td><input type="text" placeholder="Client" value={newProduction.client} onChange={(e) => setNewProduction({ ...newProduction, client: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                <td><input type="text" placeholder="Product" value={newProduction.product} onChange={(e) => setNewProduction({ ...newProduction, product: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                <td><input type="text" placeholder="Supplier" value={newProduction.supplier} onChange={(e) => setNewProduction({ ...newProduction, supplier: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                <td><input type="number" placeholder="Cost" value={newProduction.cost} onChange={(e) => setNewProduction({ ...newProduction, cost: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                <td><select value={newProduction.status} onChange={(e) => setNewProduction({ ...newProduction, status: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }}><option value="Ordered">Ordered</option><option value="In Production">In Production</option><option value="Dispatched">Dispatched</option><option value="Delayed">Delayed</option><option value="Delivered">Delivered</option></select></td>
                <td><input type="text" placeholder="Tracking" value={newProduction.tracking} onChange={(e) => setNewProduction({ ...newProduction, tracking: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                <td><button onClick={saveProduction} style={{ background: '#00c600', color: 'black', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Save</button></td>
              </tr>
            )}
            {pos.map(po => (
              editingId === po.id ? (
                <tr key={po.id} style={{ background: '#2a2a2a' }}>
                  <td><input type="date" value={editingData.order_date} onChange={(e) => setEditingData({ ...editingData, order_date: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                  <td><input type="date" value={editingData.expected_delivery} onChange={(e) => setEditingData({ ...editingData, expected_delivery: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                  <td><input type="text" value={editingData.client} onChange={(e) => setEditingData({ ...editingData, client: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                  <td><input type="text" value={editingData.product} onChange={(e) => setEditingData({ ...editingData, product: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                  <td><input type="text" value={editingData.supplier} onChange={(e) => setEditingData({ ...editingData, supplier: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                  <td><input type="number" value={editingData.cost} onChange={(e) => setEditingData({ ...editingData, cost: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                  <td><select value={editingData.status} onChange={(e) => setEditingData({ ...editingData, status: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }}><option value="ordered">Ordered</option><option value="in_production">In Production</option><option value="dispatched">Dispatched</option><option value="delayed">Delayed</option><option value="delivered">Delivered</option></select></td>
                  <td><input type="text" value={editingData.tracking} onChange={(e) => setEditingData({ ...editingData, tracking: e.target.value })} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #00c600', color: 'white', padding: '4px' }} /></td>
                  <td><button onClick={saveEdit} style={{ background: '#00c600', color: 'black', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Save</button></td>
                </tr>
              ) : (
                <tr key={po.id}>
                  <td>{po.order_date || '-'}</td>
                  <td>{po.eta || '-'}</td>
                  <td>{clients[po.client_org_id] || '-'}</td>
                  <td>{po.items?.[0]?.description || '-'}</td>
                  <td>{po.supplier_org_id || '-'}</td>
                  <td>${po.total_cost || 0}</td>
                  <td>{po.status || '-'}</td>
                  <td>{po.tracking_number_inbound || '-'}</td>
                  <td><button onClick={() => startEdit(po)} style={{ background: 'transparent', border: 'none', color: '#00c600', cursor: 'pointer', padding: '0' }}><Edit2 size={16} /></button></td>
                </tr>
              )
            ))}
            {editingId !== 'new' && (
              <tr style={{ background: '#1e1e1e', cursor: 'pointer' }} onClick={() => setEditingId('new')}>
                <td colSpan="9" style={{ textAlign: 'center', color: '#00c600', padding: '16px', fontWeight: 'bold' }}>+ Add New Production</td>
              </tr>
            )}
          </tbody>
        </table>



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