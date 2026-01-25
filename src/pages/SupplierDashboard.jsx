import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AppHeader from '@/components/layout/AppHeader';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGBadge from '@/components/ui/KGBadge';
import KGInput from '@/components/ui/KGInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Loader2, Upload, FileText, Check, CheckCircle } from 'lucide-react';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [org, setOrg] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      navigate(createPageUrl('SupplierLogin'));
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
    if (!profiles.length || !profiles[0].org_id || profiles[0].role !== 'supplier') {
      navigate(createPageUrl('SupplierLogin'));
      return;
    }
    setProfile(profiles[0]);

    const orgs = await base44.entities.Organisation.filter({ org_id: profiles[0].org_id });
    if (orgs.length) setOrg(orgs[0]);

    // Load POs for this supplier
    const pos = await base44.entities.PurchaseOrder.filter({ supplier_org_id: profiles[0].org_id });
    setPurchaseOrders(pos.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

    setLoading(false);
  };

  const handleLogout = () => base44.auth.logout(createPageUrl('SupplierLogin'));

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Extract data from PDF
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          quote_date: { type: "string", description: "Invoice/Quote date" },
          price: { type: "number", description: "Total price" },
          shipping_cost: { type: "number", description: "Shipping cost" },
          delivery_days: { type: "number", description: "Estimated delivery days" }
        }
      }
    });

    setExtractedData({
      ...extracted.output,
      pdf_url: file_url
    });
    setUploading(false);
  };

  const saveQuoteData = async () => {
    if (!selectedPO || !extractedData) return;

    // Find or create supplier quote for this PO
    const existingQuotes = await base44.entities.SupplierQuote.filter({
      sales_quote_id: selectedPO.sales_quote_id,
      supplier_org_id: profile.org_id
    });

    if (existingQuotes.length > 0) {
      await base44.entities.SupplierQuote.update(existingQuotes[0].id, {
        pdf_url: extractedData.pdf_url,
        quote_date: extractedData.quote_date,
        price: extractedData.price,
        shipping_cost: extractedData.shipping_cost,
        delivery_days: extractedData.delivery_days,
        status: 'quoted'
      });
    }

    setExtractedData(null);
  };

  const signAndReady = async () => {
    if (!selectedPO) return;

    // Update PO as parts ready
    await base44.entities.PurchaseOrder.update(selectedPO.id, {
      parts_ready: true
    });

    // Update supplier quote as signed
    const quotes = await base44.entities.SupplierQuote.filter({
      sales_quote_id: selectedPO.sales_quote_id,
      supplier_org_id: profile.org_id
    });
    if (quotes.length > 0) {
      await base44.entities.SupplierQuote.update(quotes[0].id, { signed: true });
    }

    setSelectedPO(null);
    loadData();
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
      <AppHeader 
        user={user} 
        orgId={profile?.org_id} 
        onLogout={handleLogout}
        title="KG Hub – Supplier"
      />

      <div className="max-w-4xl mx-auto p-6">
        {org && (
          <KGCard className="mb-6">
            <div className="flex items-center gap-3">
              <Package size={24} className="text-[#00C600]" />
              <div>
                <p className="text-lg">{org.name}</p>
                <p className="text-sm text-gray-500">{org.org_id}</p>
              </div>
            </div>
          </KGCard>
        )}

        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-[#00C600]" />
          <h2 className="text-lg text-gray-800">Incoming Purchase Orders</h2>
        </div>

        {purchaseOrders.length === 0 ? (
          <KGCard className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No purchase orders yet</p>
          </KGCard>
        ) : (
          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <KGCard 
                key={po.id} 
                onClick={() => setSelectedPO(po)}
                className="cursor-pointer hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00C600] text-sm">{po.po_id}</span>
                      <KGBadge status={po.status} />
                      {po.parts_ready && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle size={12} /> Ready
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {po.items?.length || 0} item(s) • Order: {new Date(po.order_date || po.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg">${po.total_cost?.toFixed(2) || '0.00'}</p>
                    {po.eta && <p className="text-xs text-gray-400">ETA: {new Date(po.eta).toLocaleDateString()}</p>}
                  </div>
                </div>
              </KGCard>
            ))}
          </div>
        )}
      </div>

      {/* PO Detail Modal */}
      <Dialog open={!!selectedPO} onOpenChange={() => { setSelectedPO(null); setExtractedData(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Purchase Order {selectedPO?.po_id}</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <KGBadge status={selectedPO.status} />
                <span className="text-sm text-gray-500">
                  {new Date(selectedPO.order_date || selectedPO.created_date).toLocaleDateString()}
                </span>
              </div>

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

              {!selectedPO.parts_ready && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Upload quote PDF to extract details:</p>
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#00C600] rounded-lg cursor-pointer hover:bg-[#00C600]/5">
                      {uploading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Upload size={20} className="text-[#00C600]" />
                          <span className="text-sm">Upload Quote PDF</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept=".pdf" onChange={handlePDFUpload} />
                    </label>
                  </div>

                  {extractedData && (
                    <div className="bg-[#00C600]/5 border border-[#00C600] rounded-lg p-4 space-y-3">
                      <p className="text-sm font-normal text-[#00C600]">Extracted Data:</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span> {extractedData.quote_date || '-'}
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span> ${extractedData.price?.toFixed(2) || '0.00'}
                        </div>
                        <div>
                          <span className="text-gray-500">Shipping:</span> ${extractedData.shipping_cost?.toFixed(2) || '0.00'}
                        </div>
                        <div>
                          <span className="text-gray-500">Delivery:</span> {extractedData.delivery_days || '-'} days
                        </div>
                      </div>
                      <KGButton size="sm" onClick={saveQuoteData}>
                        Save Quote Data
                      </KGButton>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <KGButton 
                      onClick={signAndReady} 
                      className="flex-1"
                    >
                      <Check size={16} className="mr-2" />
                      Sign & Mark Parts Ready
                    </KGButton>
                  </div>
                </>
              )}

              {selectedPO.parts_ready && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
                  <p className="text-green-800">Parts Ready for Pickup</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}