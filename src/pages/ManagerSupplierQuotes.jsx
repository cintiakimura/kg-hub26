import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGBadge from '@/components/ui/KGBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, Check, Trophy, ExternalLink 
} from 'lucide-react';

export default function ManagerSupplierQuotes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [supplierQuotes, setSupplierQuotes] = useState([]);
  const [suppliers, setSuppliers] = useState({});
  const [salesQuotes, setSalesQuotes] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);



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

    const allSQ = await base44.entities.SupplierQuote.list();
    setSupplierQuotes(allSQ);

    const orgs = await base44.entities.Organisation.filter({ org_type: 'supplier' });
    const supplierMap = {};
    orgs.forEach(o => supplierMap[o.org_id] = o);
    setSuppliers(supplierMap);

    const quotes = await base44.entities.SalesQuote.list();
    const quoteMap = {};
    quotes.forEach(q => quoteMap[q.quote_id] = q);
    setSalesQuotes(quoteMap);

    setLoading(false);
  };



  // Group supplier quotes by sales quote
  const groupedQuotes = supplierQuotes.reduce((acc, sq) => {
    if (!acc[sq.sales_quote_id]) acc[sq.sales_quote_id] = [];
    acc[sq.sales_quote_id].push(sq);
    return acc;
  }, {});

  const selectWinner = async (supplierQuote) => {
    // Mark this as accepted, others as rejected
    const group = groupedQuotes[supplierQuote.sales_quote_id];
    
    for (const sq of group) {
      if (sq.id === supplierQuote.id) {
        await base44.entities.SupplierQuote.update(sq.id, { status: 'accepted' });
      } else {
        await base44.entities.SupplierQuote.update(sq.id, { status: 'rejected' });
      }
    }

    setSelectedGroup(null);
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
            <Scale size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-[#00c600]">Supplier Quotes Comparison</h1>
          </div>

          {Object.keys(groupedQuotes).length === 0 ? (
            <KGCard className="text-center py-12">
              <Scale size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No supplier quotes to compare</p>
            </KGCard>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedQuotes).map(([salesQuoteId, quotes]) => {
                const salesQuote = salesQuotes[salesQuoteId];
                const hasWinner = quotes.some(q => q.status === 'accepted');
                const lowestPrice = Math.min(...quotes.filter(q => q.price).map(q => q.price));
                
                return (
                  <KGCard 
                    key={salesQuoteId}
                    onClick={() => setSelectedGroup({ salesQuoteId, quotes })}
                    className="cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#00C600] text-sm">{salesQuoteId}</span>
                      {hasWinner && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <Trophy size={12} /> Winner selected
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {quotes.map((sq) => (
                        <div 
                          key={sq.id} 
                          className={`p-3 rounded-lg border-2 ${
                            sq.status === 'accepted' ? 'border-green-500 bg-green-50' :
                            sq.status === 'rejected' ? 'border-gray-200 bg-gray-50 opacity-50' :
                            sq.price === lowestPrice && sq.price ? 'border-[#00C600]' : 'border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{suppliers[sq.supplier_org_id]?.name || sq.supplier_org_id}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg">${sq.price?.toFixed(2) || '-'}</span>
                            <KGBadge status={sq.status} />
                          </div>
                          {sq.delivery_days && (
                            <p className="text-xs text-gray-500 mt-1">{sq.delivery_days} days</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </KGCard>
                );
              })}
            </div>
          )}


      {/* Comparison Modal */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare Quotes - {selectedGroup?.salesQuoteId}</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedGroup.quotes.map((sq) => {
                  const isWinner = sq.status === 'accepted';
                  const isRejected = sq.status === 'rejected';
                  
                  return (
                    <KGCard 
                      key={sq.id}
                      className={`${
                        isWinner ? 'border-green-500 bg-green-50' :
                        isRejected ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-base">{suppliers[sq.supplier_org_id]?.name || sq.supplier_org_id}</p>
                        <KGBadge status={sq.status} />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price:</span>
                          <span className="text-lg">${sq.price?.toFixed(2) || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Shipping:</span>
                          <span>${sq.shipping_cost?.toFixed(2) || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery:</span>
                          <span>{sq.delivery_days || '-'} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Signed:</span>
                          <span>{sq.signed ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      {sq.pdf_url && (
                        <a 
                          href={sq.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#00C600] text-sm mt-3"
                        >
                          View PDF <ExternalLink size={12} />
                        </a>
                      )}

                      {sq.status === 'quoted' && (
                        <KGButton 
                          className="w-full mt-4"
                          onClick={() => selectWinner(sq)}
                        >
                          <Trophy size={16} className="mr-2" />
                          Select as Winner
                        </KGButton>
                      )}

                      {isWinner && (
                        <div className="mt-4 text-center text-green-600 flex items-center justify-center gap-2">
                          <Check size={16} />
                          Selected Winner
                        </div>
                      )}
                    </KGCard>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}