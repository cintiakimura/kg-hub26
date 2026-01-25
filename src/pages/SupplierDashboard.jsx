import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { FileText, Package, Settings, TruckIcon } from 'lucide-react';

export default function SupplierDashboard() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [uploading, setUploading] = useState(null);
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
    <div className="p-6 bg-[#212121] min-h-screen">
      {loading && <div>Loading...</div>}

      {!loading && (
        <div className="border border-[#00c600] rounded p-6">
          <h2 className="text-lg mb-4">Incoming POs</h2>
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
      )}
    </div>
  );
}