import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGBadge from '@/components/ui/KGBadge';
import KGInput, { KGTextarea } from '@/components/ui/KGInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, Plus, Trash2, Send, Check 
} from 'lucide-react';

export default function ManagerSalesQuotes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [clients, setClients] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [editItems, setEditItems] = useState([]);



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

    const allQuotes = await base44.entities.SalesQuote.list();
    setQuotes(allQuotes.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

    const orgs = await base44.entities.Organisation.list();
    const clientMap = {};
    const supplierList = [];
    orgs.forEach(o => {
      if (o.org_type === 'client') clientMap[o.org_id] = o;
      if (o.org_type === 'supplier') supplierList.push(o);
    });
    setClients(clientMap);
    setSuppliers(supplierList);

    setLoading(false);
  };



  const openQuote = (quote) => {
    setSelectedQuote(quote);
    setEditItems(quote.items || [{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const addItem = () => {
    setEditItems([...editItems, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...editItems];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
    }
    setEditItems(updated);
  };

  const removeItem = (index) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = editItems.reduce((sum, item) => sum + (item.total || 0), 0);
    return { subtotal, shipping: 0, total: subtotal };
  };

  const saveQuote = async (status = 'quoted') => {
    const totals = calculateTotals();
    await base44.entities.SalesQuote.update(selectedQuote.id, {
      items: editItems,
      subtotal: totals.subtotal,
      total: totals.total,
      status
    });
    setSelectedQuote(null);
    loadData();
  };

  const createPurchaseOrders = async () => {
    // When quote is approved, create POs for each supplier
    const quoteId = selectedQuote.quote_id;
    
    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i];
      const poId = `${quoteId}-S-${String(i + 1).padStart(3, '0')}`;
      
      await base44.entities.PurchaseOrder.create({
        po_id: poId,
        sales_quote_id: selectedQuote.quote_id,
        supplier_org_id: supplier.org_id,
        client_org_id: selectedQuote.client_org_id,
        status: 'ordered',
        order_date: new Date().toISOString().split('T')[0],
        items: editItems,
        total_cost: calculateTotals().total
      });

      // Also create supplier quote request
      const sqId = `SQ-${Date.now()}-${i}`;
      await base44.entities.SupplierQuote.create({
        supplier_quote_id: sqId,
        sales_quote_id: selectedQuote.quote_id,
        supplier_org_id: supplier.org_id,
        status: 'requested',
        items: editItems
      });
    }

    await base44.entities.SalesQuote.update(selectedQuote.id, { status: 'completed' });
    setSelectedQuote(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-[#00c600]">Sales Quotes</h1>
          </div>

          {quotes.length === 0 ? (
            <KGCard className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No quotes yet</p>
            </KGCard>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <KGCard 
                  key={quote.id}
                  onClick={() => openQuote(quote)}
                  className="cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#00C600] text-sm">{quote.quote_id}</span>
                        <KGBadge status={quote.status} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {clients[quote.client_org_id]?.name || quote.client_org_id}
                      </p>
                      {quote.client_notes && (
                        <p className="text-xs text-gray-400 mt-1">{quote.client_notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg">${quote.total?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-gray-500">{quote.items?.length || 0} items</p>
                    </div>
                  </div>
                </KGCard>
              ))}
            </div>
          )}


      {/* Quote Edit Modal */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote {selectedQuote?.quote_id}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Client:</p>
                  <p>{clients[selectedQuote.client_org_id]?.name || selectedQuote.client_org_id}</p>
                </div>
                <KGBadge status={selectedQuote.status} />
              </div>

              {selectedQuote.client_notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Client notes:</p>
                  <p className="text-sm">{selectedQuote.client_notes}</p>
                </div>
              )}

              {/* Items Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Line Items</p>
                  <KGButton size="sm" variant="outline" onClick={addItem}>
                    <Plus size={14} className="mr-1" /> Add Item
                  </KGButton>
                </div>

                {editItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <KGInput
                        label={idx === 0 ? "Description" : ""}
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="w-20">
                      <KGInput
                        label={idx === 0 ? "Qty" : ""}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-28">
                      <KGInput
                        label={idx === 0 ? "Unit Price" : ""}
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-24 text-right pb-2">
                      ${item.total?.toFixed(2) || '0.00'}
                    </div>
                    <button 
                      onClick={() => removeItem(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span className="text-[#00C600]">${calculateTotals().total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {selectedQuote.status === 'pending' && (
                  <KGButton onClick={() => saveQuote('quoted')} className="flex-1">
                    <Send size={16} className="mr-2" />
                    Send Quote to Client
                  </KGButton>
                )}
                
                {selectedQuote.status === 'approved' && (
                  <KGButton onClick={createPurchaseOrders} className="flex-1">
                    <Check size={16} className="mr-2" />
                    Create Purchase Orders
                  </KGButton>
                )}

                {(selectedQuote.status === 'pending' || selectedQuote.status === 'quoted') && (
                  <KGButton variant="outline" onClick={() => saveQuote(selectedQuote.status)}>
                    Save Draft
                  </KGButton>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}