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
    <div className="p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {menuCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              onClick={() => navigate(createPageUrl(card.page))}
              className="bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all border border-[#00c600]"
            >
              <Icon size={24} color="#00c600" className="mb-2" />
              <div className="text-sm mb-1">{card.name}</div>
              <div className="text-xs opacity-70">{card.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-6 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c600" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <div>
            <div className="text-lg">Your Offers</div>
            <div className="text-xs opacity-70">Manage incoming requests</div>
          </div>
          <div className="ml-auto">
            <TableExport data={quotes} filename="supplier-quotes" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="border border-[#00c600] rounded-lg p-4">
            <div className="text-2xl mb-1">{openPOs.length}</div>
            <div className="text-xs opacity-70">Open POs</div>
          </div>
          <div className="border border-[#00c600] rounded-lg p-4">
            <div className="text-2xl mb-1">{submitted.length}</div>
            <div className="text-xs opacity-70">Submitted</div>
          </div>
          <div className="border border-[#00c600] rounded-lg p-4">
            <div className="text-2xl mb-1">{won.length}</div>
            <div className="text-xs opacity-70">Won</div>
          </div>
        </div>

        <div className="border-t border-[#00c600] pt-4">
          <table>
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Sales Quote</th>
                <th>Date</th>
                <th>Price</th>
                <th>Shipping</th>
                <th>Delivery</th>
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
                  <td>{q.delivery_days}d</td>
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
      </div>
    </div>
  );
}