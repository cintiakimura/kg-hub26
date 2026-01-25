import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGBadge from '@/components/ui/KGBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car, FileText, Package, Loader2, Check, X } from 'lucide-react';

export default function ClientQuotes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
    if (!profiles.length || !profiles[0].org_id) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }
    setProfile(profiles[0]);

    const orgQuotes = await base44.entities.SalesQuote.filter({ client_org_id: profiles[0].org_id });
    setQuotes(orgQuotes.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

    setLoading(false);
  };



  const approveQuote = async (quote) => {
    await base44.entities.SalesQuote.update(quote.id, { status: 'approved' });
    loadData();
    setSelectedQuote(null);
  };

  const rejectQuote = async (quote) => {
    await base44.entities.SalesQuote.update(quote.id, { status: 'rejected' });
    loadData();
    setSelectedQuote(null);
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
            <h1 className="text-xl text-[#00c600]">My Quotes</h1>
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
                  onClick={() => setSelectedQuote(quote)}
                  className="cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#00C600] text-sm">{quote.quote_id}</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {quote.items?.length || 0} item(s) • {new Date(quote.created_date).toLocaleDateString()}
                      </p>
                      {quote.client_notes && (
                        <p className="text-xs text-gray-400 mt-1">{quote.client_notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <KGBadge status={quote.status} />
                      {quote.total > 0 && (
                        <span className="text-lg">${quote.total?.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </KGCard>
              ))}
            </div>
          )}


      {/* Quote Detail Modal */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quote {selectedQuote?.quote_id}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <KGBadge status={selectedQuote.status} />
                <span className="text-sm text-gray-500">
                  {new Date(selectedQuote.created_date).toLocaleDateString()}
                </span>
              </div>

              {selectedQuote.client_notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Your notes:</p>
                  <p className="text-sm">{selectedQuote.client_notes}</p>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-normal text-gray-600">Item</th>
                      <th className="text-right p-3 font-normal text-gray-600">Qty</th>
                      <th className="text-right p-3 font-normal text-gray-600">Price</th>
                      <th className="text-right p-3 font-normal text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.items?.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">${item.unit_price?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-right">${item.total?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedQuote.status === 'quoted' && selectedQuote.total > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${selectedQuote.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {selectedQuote.shipping_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${selectedQuote.shipping_cost?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg border-t pt-3">
                    <span>Total</span>
                    <span className="text-[#00C600]">${selectedQuote.total?.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <KGButton variant="outline" onClick={() => rejectQuote(selectedQuote)} className="flex-1">
                      <X size={16} className="mr-2" />
                      Reject
                    </KGButton>
                    <KGButton onClick={() => approveQuote(selectedQuote)} className="flex-1">
                      <Check size={16} className="mr-2" />
                      Approve & Order
                    </KGButton>
                  </div>
                </div>
              )}

              {selectedQuote.notes && (
                <div className="bg-[#00C600]/5 border border-[#00C600] p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Manager notes:</p>
                  <p className="text-sm">{selectedQuote.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}