import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Package, Settings, TruckIcon, Plus } from 'lucide-react';

export default function SupplierDashboard() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    cost: '',
    stock: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const profile = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    
    if (!profile) {
      navigate(createPageUrl('SupplierLogin'));
      return;
    }

    const orgData = (await base44.entities.Organisation.filter({ org_id: profile.org_id }))[0];
    setOrg(orgData);

    const quotesData = await base44.entities.SupplierQuote.filter({ supplier_org_id: profile.org_id });
    setQuotes(quotesData);

    setLoading(false);
  };

  const handleUpload = async (quoteId, file) => {
    setUploading(quoteId);
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          quote_date: { type: 'string' },
          price: { type: 'number' },
          shipping_cost: { type: 'number' },
          delivery_days: { type: 'number' }
        }
      }
    });

    await base44.entities.SupplierQuote.update(quoteId, {
      pdf_url: file_url,
      status: 'quoted',
      ...extracted.output
    });

    setUploading(null);
    loadData();
  };

  const markReady = async (quoteId) => {
    await base44.entities.SupplierQuote.update(quoteId, { signed: true });
    loadData();
  };

  const saveProduct = async () => {
    await base44.entities.Organisation.create({
      name: newProduct.name,
      cost: parseFloat(newProduct.cost) || 0,
      stock: parseInt(newProduct.stock) || 0
    });
    toast.success('Product added');
    setShowAddProductModal(false);
    setNewProduct({ name: '', cost: '', stock: '' });
    loadData();
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const openPOs = quotes.filter(q => q.status === 'requested');
  const submitted = quotes.filter(q => q.status === 'quoted' && !q.signed);
  const won = quotes.filter(q => q.signed);

  const menuCards = [
    { icon: FileText, name: 'All Quotes', desc: 'View all requests', page: 'SupplierDashboard' },
    { icon: Package, name: 'Open POs', desc: 'Pending uploads', page: 'SupplierDashboard' },
    { icon: TruckIcon, name: 'Won Orders', desc: 'Accepted quotes', page: 'SupplierDashboard' },
    { icon: Settings, name: 'Profile', desc: 'Company settings', page: 'SupplierDashboard' }
  ];

  return (
    <div className="bg-[#212121] min-h-screen ml-16">
      <div className="bg-[#212121] flex items-center justify-between px-6" style={{ height: '120px', width: '100%' }}>
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '400', marginLeft: '20px' }}>Products & Quotes</h1>
        <Button onClick={() => setShowAddProductModal(true)} className="bg-[#00c600] text-white border border-[#00c600]">
          <Plus size={16} className="mr-1" /> Product
        </Button>
      </div>
      <div className="px-6 py-6" style={{ width: '100%' }}>
      {loading && <div>Loading...</div>}

      {!loading && (
        <div>
          <div className="border border-[#00c600] rounded p-6" style={{ width: '100%' }}>
          <h2 className="text-lg mb-4 text-[#00c600]">Incoming POs</h2>
          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Sales Quote</th>
                <th>Date</th>
                <th>Price</th>
                <th>Delivery Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td>{q.supplier_quote_id}</td>
                  <td>{q.sales_quote_id}</td>
                  <td>{q.quote_date || '-'}</td>
                  <td>${q.price || '-'}</td>
                  <td>{q.delivery_days || '-'}</td>
                  <td>{q.status}</td>
                  <td>
                    {q.status === 'requested' && (
                      <label className="cursor-pointer">
                        {uploading === q.id ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => handleUpload(q.id, e.target.files[0])}
                        />
                      </label>
                    )}
                    {q.status === 'quoted' && !q.signed && (
                      <button onClick={() => markReady(q.id)}>Sign</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
           <DialogContent className="max-w-md bg-[#212121] border border-[#00c600]">
             <DialogHeader>
               <DialogTitle className="text-white">Add Product</DialogTitle>
             </DialogHeader>
             <div className="space-y-3">
               <Input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
               <Input placeholder="Cost" type="number" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} />
               <Input placeholder="Stock" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
               <div className="flex gap-2 pt-2 border-t border-[#00c600]">
                 <Button onClick={() => setShowAddProductModal(false)} variant="outline" className="flex-1">Cancel</Button>
                 <Button onClick={saveProduct} className="flex-1 bg-[#00c600] text-white">Save</Button>
               </div>
             </div>
           </DialogContent>
          </Dialog>
          </div>
          )}
      </div>
    </div>
  );
}