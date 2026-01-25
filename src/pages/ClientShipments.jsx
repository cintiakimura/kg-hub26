import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AppHeader from '@/components/layout/AppHeader';
import SideNav from '@/components/layout/SideNav';
import KGCard from '@/components/ui/KGCard';
import KGBadge from '@/components/ui/KGBadge';
import { Car, FileText, Package, Loader2, Truck, ExternalLink } from 'lucide-react';

export default function ClientShipments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);

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

    // Only outbound shipments visible to client
    const clientShipments = await base44.entities.Shipment.filter({ 
      org_id: profiles[0].org_id,
      client_visible: true
    });
    setShipments(clientShipments.sort((a, b) => new Date(a.eta) - new Date(b.eta)));

    setLoading(false);
  };

  const handleLogout = () => base44.auth.logout(createPageUrl('ClientLogin'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} orgId={profile?.org_id} onLogout={handleLogout} title="KG Hub – Client" />
      
      <div className="flex">
        <SideNav items={navItems} currentPage="ClientShipments" />
        
        <main className="flex-1 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-gray-800">My Shipments</h1>
          </div>

          {shipments.length === 0 ? (
            <KGCard className="text-center py-12">
              <Truck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No active shipments</p>
            </KGCard>
          ) : (
            <div className="space-y-3">
              {shipments.map((shipment) => (
                <KGCard key={shipment.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#00C600] text-sm">{shipment.shipment_id}</span>
                        <KGBadge status={shipment.status} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {shipment.carrier} • {shipment.tracking_number}
                      </p>
                      {shipment.eta && (
                        <p className="text-xs text-gray-400 mt-1">
                          ETA: {new Date(shipment.eta).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <a 
                      href={`https://www.fedex.com/fedextrack/?trknbr=${shipment.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00C600] hover:underline flex items-center gap-1 text-sm"
                    >
                      Track
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </KGCard>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}