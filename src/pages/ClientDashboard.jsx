import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AppHeader from '@/components/layout/AppHeader';
import SideNav from '@/components/layout/SideNav';
import KGCard, { KGCardTitle, KGCardContent } from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGBadge from '@/components/ui/KGBadge';
import { Car, Plus, FileText, Package, Loader2 } from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [quotes, setQuotes] = useState([]);

  const navItems = [
    { page: 'ClientDashboard', label: 'My Vehicles', icon: Car },
    { page: 'ClientQuotes', label: 'My Quotes', icon: FileText },
    { page: 'ClientShipments', label: 'Shipments', icon: Package }
  ];

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
    
    // Load vehicles for this org
    const orgVehicles = await base44.entities.Vehicle.filter({ org_id: profiles[0].org_id });
    setVehicles(orgVehicles);

    // Load quotes for this org
    const orgQuotes = await base44.entities.SalesQuote.filter({ client_org_id: profiles[0].org_id });
    setQuotes(orgQuotes);

    setLoading(false);
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('ClientLogin'));
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
        title="KG Hub – Client"
      />
      
      <div className="flex">
        <SideNav items={navItems} currentPage="ClientDashboard" />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Car size={24} className="text-[#00C600]" />
              <h1 className="text-xl text-gray-800">My Vehicles</h1>
            </div>
            <KGButton onClick={() => navigate(createPageUrl('ClientVehicleAdd'))}>
              <Plus size={16} className="mr-2" />
              Add Vehicle
            </KGButton>
          </div>

          {vehicles.length === 0 ? (
            <KGCard className="text-center py-12">
              <Car size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No vehicles added yet</p>
              <KGButton onClick={() => navigate(createPageUrl('ClientVehicleAdd'))}>
                Add Your First Vehicle
              </KGButton>
            </KGCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <KGCard 
                  key={vehicle.id} 
                  onClick={() => navigate(createPageUrl(`ClientVehicleDetail?id=${vehicle.id}`))}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#00C600] text-sm">{vehicle.vehicle_id}</span>
                    {vehicle.vin && <span className="text-xs text-gray-400">{vehicle.vin}</span>}
                  </div>
                  
                  {vehicle.photos?.length > 0 && (
                    <div className="h-32 mb-3 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={vehicle.photos[0]} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <KGCardTitle>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </KGCardTitle>
                  
                  <KGCardContent className="mt-2">
                    {vehicle.trim && <p>{vehicle.trim}</p>}
                    {vehicle.engine && <p className="text-gray-500">{vehicle.engine}</p>}
                  </KGCardContent>
                </KGCard>
              ))}
            </div>
          )}

          {quotes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg text-gray-800 mb-4">Recent Quote Requests</h2>
              <div className="space-y-3">
                {quotes.slice(0, 5).map((quote) => (
                  <KGCard key={quote.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-[#00C600] text-sm">{quote.quote_id}</span>
                      <p className="text-sm text-gray-600">{quote.client_notes || 'Parts request'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <KGBadge status={quote.status} />
                      {quote.total && <span className="text-sm">${quote.total?.toFixed(2)}</span>}
                    </div>
                  </KGCard>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}