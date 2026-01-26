import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, Building2, RefreshCw, Plus 
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
  const [addClientModal, setAddClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    vat_number: '',
    contact_email: '',
    contact_phone: '',
    contact_name: '',
    billing_address: '',
    billing_contact_name: '',
    billing_contact_email: '',
    billing_contact_phone: '',
    delivery_address: '',
    delivery_contact_name: '',
    delivery_contact_email: '',
    delivery_contact_phone: ''
  });



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

  const saveNewClient = async () => {
    const newOrgId = `C-${String(clients.length + 1).padStart(3, '0')}`;
    await base44.entities.Organisation.create({
      org_id: newOrgId,
      org_type: 'client',
      name: newClient.name,
      vat_number: newClient.vat_number,
      contact_email: newClient.contact_email,
      contact_phone: newClient.contact_phone,
      contact_name: newClient.contact_name,
      billing_address: newClient.billing_address,
      delivery_address: newClient.delivery_address
    });
    toast.success('Client added successfully');
    setNewClient({
      name: '',
      vat_number: '',
      contact_email: '',
      contact_phone: '',
      contact_name: '',
      billing_address: '',
      billing_contact_name: '',
      billing_contact_email: '',
      billing_contact_phone: '',
      delivery_address: '',
      delivery_contact_name: '',
      delivery_contact_email: '',
      delivery_contact_phone: ''
    });
    setAddClientModal(false);
    navigate(createPageUrl('ClientVehicleAdd'));
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
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-[#00C600]" />
              <h1 className="text-xl text-[#00c600]">Clients</h1>
              <span className="text-sm text-gray-500 ml-2">({clients.length})</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setAddClientModal(true)} className="bg-[#00c600] text-white border border-[#00c600]">
                <Plus size={16} className="mr-1" /> Add Client
              </Button>
              <Button onClick={() => { const client = selectedClient; setSelectedClient(null); resellToClient(client); }} disabled={!selectedClient} className="bg-[#00c600] text-white border border-[#00c600] disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={16} className="mr-1" /> New Quote
              </Button>
            </div>
          </div>

          {clients.length === 0 ? (
            <KGCard className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No clients registered yet</p>
            </KGCard>
          ) : (
            <div className="border border-[#00c600] rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1e1e1e] border-b border-[#00c600]">
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">ID</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Name</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Email</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Phone</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Vehicles</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Quotes</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Total Spent</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, idx) => {
                    const stats = getClientStats(client.org_id);
                    return (
                      <tr key={client.id} className={`border-b border-[#00c600] ${idx % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#2a2a2a]'}`}>
                        <td className="px-4 py-3 text-[#00c600] text-sm cursor-pointer hover:underline" onClick={() => navigate(createPageUrl('ClientOverview') + `?clientId=${client.org_id}`)}>{client.org_id}</td>
                        <td className="px-4 py-3 text-white text-sm cursor-pointer hover:underline" onClick={() => navigate(createPageUrl('ClientOverview') + `?clientId=${client.org_id}`)}>{client.name}</td>
                        <td className="px-4 py-3 text-white text-sm">{client.contact_email || '-'}</td>
                        <td className="px-4 py-3 text-white text-sm">{client.contact_phone || '-'}</td>
                        <td className="px-4 py-3 text-white text-sm">{stats.vehicles}</td>
                        <td className="px-4 py-3 text-white text-sm">{stats.quotes}</td>
                        <td className="px-4 py-3 text-[#00C600] text-sm">${stats.totalSpent.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={(e) => { e.stopPropagation(); resellToClient(client); }} className="text-[#00c600] hover:text-white text-xs">Resell</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}


      {/* Add Client Modal */}
      <Dialog open={addClientModal} onOpenChange={setAddClientModal}>
       <DialogContent className="w-[70vw] max-h-[70vh] bg-[#212121] border border-[#00c600]">
         <DialogHeader>
           <DialogTitle className="text-white">Add Client</DialogTitle>
         </DialogHeader>
         <div className="space-y-2 max-h-96 overflow-y-auto">
           {/* General Info */}
           <div>
             <label className="text-white text-sm">Name</label>
             <Input className="mt-1" type="text" placeholder="Client name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">VAT / Tax ID</label>
             <Input className="mt-1" type="text" placeholder="VAT/CNPJ" value={newClient.vat_number} onChange={(e) => setNewClient({ ...newClient, vat_number: e.target.value })} />
             <p className="text-gray-500 text-xs mt-1">Auto-fill if EU/Brazil VAT/CNPJ</p>
           </div>

           {/* Main Contact */}
           <div className="border-t border-[#00c600] pt-2 mt-2">
             <p className="text-[#00c600] text-xs font-normal">Main Contact</p>
           </div>

           <div>
             <label className="text-white text-sm">Email</label>
             <Input className="mt-1" type="email" placeholder="Email" value={newClient.contact_email} onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">Phone</label>
             <Input className="mt-1" type="tel" placeholder="Phone" value={newClient.contact_phone} onChange={(e) => setNewClient({ ...newClient, contact_phone: e.target.value })} />
           </div>

           {/* Billing Contact */}
           <div className="border-t border-[#00c600] pt-2 mt-2">
             <p className="text-[#00c600] text-xs font-normal">Billing Contact</p>
           </div>

           <div>
             <label className="text-white text-sm">Billing Contact Name</label>
             <Input className="mt-1" type="text" placeholder="Name" value={newClient.billing_contact_name} onChange={(e) => setNewClient({ ...newClient, billing_contact_name: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">Billing Contact Email</label>
             <Input className="mt-1" type="email" placeholder="Email" value={newClient.billing_contact_email} onChange={(e) => setNewClient({ ...newClient, billing_contact_email: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">Billing Contact Phone</label>
             <Input className="mt-1" type="tel" placeholder="Phone" value={newClient.billing_contact_phone} onChange={(e) => setNewClient({ ...newClient, billing_contact_phone: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">Billing Address</label>
             <textarea className="mt-1 w-full p-2 bg-white dark:bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm" placeholder="Billing address" value={newClient.billing_address} onChange={(e) => setNewClient({ ...newClient, billing_address: e.target.value })} />
           </div>

           {/* Delivery Contact */}
           <div className="border-t border-[#00c600] pt-2 mt-2">
             <p className="text-[#00c600] text-xs font-normal">Delivery Contact</p>
           </div>

           <div>
             <label className="text-white text-sm">Delivery Contact Name</label>
             <Input className="mt-1" type="text" placeholder="Name" value={newClient.delivery_contact_name} onChange={(e) => setNewClient({ ...newClient, delivery_contact_name: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">Delivery Contact Email</label>
             <Input className="mt-1" type="email" placeholder="Email" value={newClient.delivery_contact_email} onChange={(e) => setNewClient({ ...newClient, delivery_contact_email: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">Delivery Contact Phone</label>
             <Input className="mt-1" type="tel" placeholder="Phone" value={newClient.delivery_contact_phone} onChange={(e) => setNewClient({ ...newClient, delivery_contact_phone: e.target.value })} />
           </div>

           <div>
             <label className="text-white text-sm">Delivery Address</label>
             <textarea className="mt-1 w-full p-2 bg-white dark:bg-[#2a2a2a] text-white border border-[#00c600] rounded text-sm" placeholder="Delivery address" value={newClient.delivery_address} onChange={(e) => setNewClient({ ...newClient, delivery_address: e.target.value })} />
           </div>

           <div className="flex gap-2 pt-4 border-t border-[#00c600]">
             <Button onClick={() => setAddClientModal(false)} variant="outline" className="flex-1">Cancel</Button>
             <Button onClick={saveNewClient} className="flex-1 bg-[#00c600] text-white">Save Client</Button>
           </div>
         </div>
       </DialogContent>
      </Dialog>


    </div>
  );
}