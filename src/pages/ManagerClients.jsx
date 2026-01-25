import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, Building2, RefreshCw 
} from 'lucide-react';

export default function ManagerClients() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [quotes, setQuotes] = useState([]);



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

    // Load all client orgs
    const orgs = await base44.entities.Organisation.filter({ org_type: 'client' });
    setClients(orgs);

    // Load all vehicles and quotes for stats
    const allVehicles = await base44.entities.Vehicle.list();
    setVehicles(allVehicles);

    const allQuotes = await base44.entities.SalesQuote.list();
    setQuotes(allQuotes);

    setLoading(false);
  };



  const getClientStats = (orgId) => {
    const clientVehicles = vehicles.filter(v => v.org_id === orgId);
    const clientQuotes = quotes.filter(q => q.client_org_id === orgId);
    const totalSpent = clientQuotes
      .filter(q => q.status === 'completed' || q.status === 'approved')
      .reduce((sum, q) => sum + (q.total || 0), 0);
    return { vehicles: clientVehicles.length, quotes: clientQuotes.length, totalSpent };
  };

  const resellToClient = async (client) => {
    // Create a new sales quote for the client
    const quoteNum = quotes.length + 1;
    const quoteId = `Q-${String(quoteNum).padStart(4, '0')}`;
    
    await base44.entities.SalesQuote.create({
      quote_id: quoteId,
      client_org_id: client.org_id,
      status: 'pending',
      items: [],
      client_notes: 'Manager initiated resell'
    });

    navigate(createPageUrl('ManagerSalesQuotes'));
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
            <Users size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-gray-800">Clients</h1>
            <span className="text-sm text-gray-500 ml-2">({clients.length})</span>
          </div>

          {clients.length === 0 ? (
            <KGCard className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No clients registered yet</p>
            </KGCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => {
                const stats = getClientStats(client.org_id);
                return (
                  <KGCard 
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[#00C600] text-sm">{client.org_id}</span>
                      <KGButton 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); resellToClient(client); }}
                      >
                        <RefreshCw size={12} className="mr-1" />
                        Resell
                      </KGButton>
                    </div>
                    
                    <p className="text-base">{client.name}</p>
                    
                    {client.contact_name && (
                      <p className="text-sm text-gray-500 mt-1">{client.contact_name}</p>
                    )}
                    
                    <div className="flex gap-4 mt-4 text-xs text-gray-500">
                      <span>{stats.vehicles} vehicles</span>
                      <span>{stats.quotes} quotes</span>
                      <span className="text-[#00C600]">${stats.totalSpent.toFixed(2)}</span>
                    </div>
                  </KGCard>
                );
              })}
            </div>
          )}


      {/* Client Detail Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedClient?.name}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[#00C600]">{selectedClient.org_id}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedClient.vat_number && (
                  <div>
                    <span className="text-gray-500">VAT:</span>
                    <p>{selectedClient.vat_number}</p>
                  </div>
                )}
                {selectedClient.contact_name && (
                  <div>
                    <span className="text-gray-500">Contact:</span>
                    <p>{selectedClient.contact_name}</p>
                  </div>
                )}
                {selectedClient.contact_email && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p>{selectedClient.contact_email}</p>
                  </div>
                )}
                {selectedClient.contact_phone && (
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p>{selectedClient.contact_phone}</p>
                  </div>
                )}
              </div>

              {selectedClient.billing_address && (
                <div>
                  <span className="text-sm text-gray-500">Billing Address:</span>
                  <p className="text-sm">{selectedClient.billing_address}</p>
                </div>
              )}

              {selectedClient.delivery_address && (
                <div>
                  <span className="text-sm text-gray-500">Delivery Address:</span>
                  <p className="text-sm">{selectedClient.delivery_address}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <KGButton 
                  className="w-full"
                  onClick={() => { setSelectedClient(null); resellToClient(selectedClient); }}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Create New Quote for Client
                </KGButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}