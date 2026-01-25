import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGInput, { KGTextarea, KGSelect } from '@/components/ui/KGInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, Plus, Pencil, Trash2, Upload, X 
} from 'lucide-react';

export default function ManagerPurchases() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    receipt_url: '',
    notes: ''
  });



  const categories = [
    { value: 'office', label: 'Office Supplies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'software', label: 'Software' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
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

    const allPurchases = await base44.entities.Purchase.list();
    setPurchases(allPurchases.sort((a, b) => new Date(b.date) - new Date(a.date)));

    setLoading(false);
  };



  const openModal = (purchase = null) => {
    if (purchase) {
      setEditingPurchase(purchase);
      setForm({
        description: purchase.description || '',
        category: purchase.category || '',
        amount: purchase.amount?.toString() || '',
        date: purchase.date || new Date().toISOString().split('T')[0],
        vendor: purchase.vendor || '',
        receipt_url: purchase.receipt_url || '',
        notes: purchase.notes || ''
      });
    } else {
      setEditingPurchase(null);
      setForm({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        receipt_url: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const generatePurchaseId = async () => {
    const num = purchases.length + 1;
    return `PUR-${String(num).padStart(3, '0')}`;
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, receipt_url: file_url });
    setUploading(false);
  };

  const savePurchase = async () => {
    if (editingPurchase) {
      await base44.entities.Purchase.update(editingPurchase.id, {
        description: form.description,
        category: form.category,
        amount: parseFloat(form.amount) || 0,
        date: form.date,
        vendor: form.vendor,
        receipt_url: form.receipt_url,
        notes: form.notes
      });
    } else {
      const purchaseId = await generatePurchaseId();
      await base44.entities.Purchase.create({
        purchase_id: purchaseId,
        description: form.description,
        category: form.category,
        amount: parseFloat(form.amount) || 0,
        date: form.date,
        vendor: form.vendor,
        receipt_url: form.receipt_url,
        notes: form.notes
      });
    }
    setShowModal(false);
    loadData();
  };

  const deletePurchase = async (purchase) => {
    if (confirm('Delete this purchase?')) {
      await base44.entities.Purchase.delete(purchase.id);
      loadData();
    }
  };

  const totalSpend = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  const categoryTotals = purchases.reduce((acc, p) => {
    const cat = p.category || 'other';
    acc[cat] = (acc[cat] || 0) + (p.amount || 0);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} className="text-[#00C600]" />
              <h1 className="text-xl text-[#00c600]">Non-Production Purchases</h1>
            </div>
            <KGButton onClick={() => openModal()}>
              <Plus size={16} className="mr-2" />
              Add Purchase
            </KGButton>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KGCard>
              <p className="text-sm text-gray-500">Total Spend</p>
              <p className="text-2xl text-[#00C600]">${totalSpend.toFixed(2)}</p>
            </KGCard>
            {Object.entries(categoryTotals).slice(0, 3).map(([cat, total]) => (
              <KGCard key={cat}>
                <p className="text-sm text-gray-500 capitalize">{cat}</p>
                <p className="text-lg">${total.toFixed(2)}</p>
              </KGCard>
            ))}
          </div>

          {/* Purchases List */}
          {purchases.length === 0 ? (
            <KGCard className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No purchases recorded</p>
            </KGCard>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <KGCard key={purchase.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00C600] text-sm">{purchase.purchase_id}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">
                        {purchase.category}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{purchase.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      {purchase.vendor && <span>{purchase.vendor}</span>}
                      <span>{new Date(purchase.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg">${purchase.amount?.toFixed(2)}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openModal(purchase)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Pencil size={16} className="text-gray-500" />
                      </button>
                      <button 
                        onClick={() => deletePurchase(purchase)}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </KGCard>
              ))}
            </div>
          )}


      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPurchase ? 'Edit Purchase' : 'Add Purchase'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <KGInput
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What was purchased"
            />

            <KGSelect
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={categories}
              placeholder="Select category..."
            />

            <div className="grid grid-cols-2 gap-4">
              <KGInput
                label="Amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
              <KGInput
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <KGInput
              label="Vendor"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              placeholder="Where purchased"
            />

            <div>
              <label className="text-sm text-gray-600 block mb-2">Receipt</label>
              {form.receipt_url ? (
                <div className="relative w-full h-32 border-2 border-[#00C600] rounded-lg overflow-hidden">
                  <img src={form.receipt_url} alt="" className="w-full h-full object-contain" />
                  <button 
                    onClick={() => setForm({ ...form, receipt_url: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#00C600] rounded-lg cursor-pointer hover:bg-[#00C600]/5">
                  {uploading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Upload size={20} className="text-[#00C600]" />
                      <span className="text-sm">Upload Receipt</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleReceiptUpload} />
                </label>
              )}
            </div>

            <KGTextarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes"
            />

            <div className="flex gap-3">
              <KGButton variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </KGButton>
              <KGButton onClick={savePurchase} className="flex-1">
                {editingPurchase ? 'Update' : 'Add'} Purchase
              </KGButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}