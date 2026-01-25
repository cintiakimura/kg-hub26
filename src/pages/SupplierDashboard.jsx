import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';

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

  return (
    <div className="p-8">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
        alt="KG Logo"
        style={{ height: 38 }}
        className="mb-8"
      />
      
      <TableExport data={quotes} filename="supplier-quotes" />

      <h2 className="text-lg mb-4">Incoming Purchase Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Quote ID</th>
            <th>Sales Quote</th>
            <th>Date</th>
            <th>Price</th>
            <th>Shipping</th>
            <th>Delivery (days)</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(q => (
            <tr key={q.id}>
              <td>{q.supplier_quote_id}</td>
              <td>{q.sales_quote_id}</td>
              <td>{q.quote_date}</td>
              <td>{q.price}</td>
              <td>{q.shipping_cost}</td>
              <td>{q.delivery_days}</td>
              <td>{q.status}</td>
              <td>
                {q.status === 'requested' && (
                  <label className="cursor-pointer">
                    {uploading === q.id ? 'Uploading...' : 'Upload PDF'}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleUpload(q.id, e.target.files[0])}
                    />
                  </label>
                )}
                {q.status === 'quoted' && !q.signed && (
                  <button onClick={() => markReady(q.id)}>Sign & Ready</button>
                )}
                {q.signed && <span>Ready</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}