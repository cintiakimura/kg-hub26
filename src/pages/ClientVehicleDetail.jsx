import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard, { KGCardTitle } from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGInput, { KGTextarea, KGSelect } from '@/components/ui/KGInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car, ArrowLeft, Loader2, Plus, Upload, X, Plug, Send } from 'lucide-react';

export default function ClientVehicleDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [connectorForm, setConnectorForm] = useState({
    system: '',
    color: '',
    pin_count: '',
    photos: [],
    scheme_url: '',
    functions: ''
  });

  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('id');

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

    // Load vehicle
    const vehicles = await base44.entities.Vehicle.filter({ org_id: profiles[0].org_id });
    const v = vehicles.find(v => v.id === vehicleId);
    if (!v) {
      navigate(createPageUrl('ClientDashboard'));
      return;
    }
    setVehicle(v);

    // Load connectors
    const vehicleConnectors = await base44.entities.Connector.filter({ vehicle_id: vehicleId });
    setConnectors(vehicleConnectors);

    setLoading(false);
  };



  const handlePhotoUpload = async (e, isScheme = false) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (isScheme) {
        setConnectorForm(f => ({ ...f, scheme_url: file_url }));
      } else {
        setConnectorForm(f => ({ ...f, photos: [...f.photos, file_url] }));
      }
    }
    setUploading(false);
  };

  const removePhoto = (index) => {
    setConnectorForm(f => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index)
    }));
  };

  const generateConnectorId = async () => {
    const all = await base44.entities.Connector.filter({ org_id: profile.org_id });
    const num = all.length + 1;
    return `CON-${String(num).padStart(3, '0')}`;
  };

  const saveConnector = async () => {
    const connId = await generateConnectorId();
    await base44.entities.Connector.create({
      connector_id: connId,
      vehicle_id: vehicleId,
      org_id: profile.org_id,
      system: connectorForm.system,
      color: connectorForm.color,
      pin_count: connectorForm.pin_count ? parseInt(connectorForm.pin_count) : null,
      photos: connectorForm.photos,
      scheme_url: connectorForm.scheme_url,
      functions: connectorForm.functions
    });

    setConnectorForm({ system: '', color: '', pin_count: '', photos: [], scheme_url: '', functions: '' });
    setShowConnectorModal(false);
    loadData();
  };

  const toggleItemSelection = (connector) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === connector.id);
      if (exists) {
        return prev.filter(i => i.id !== connector.id);
      }
      return [...prev, connector];
    });
  };

  const generateQuoteId = async () => {
    const quotes = await base44.entities.SalesQuote.list();
    const num = quotes.length + 1;
    return `Q-${String(num).padStart(4, '0')}`;
  };

  const sendQuoteRequest = async (notes) => {
    const quoteId = await generateQuoteId();
    await base44.entities.SalesQuote.create({
      quote_id: quoteId,
      client_org_id: profile.org_id,
      vehicle_id: vehicleId,
      status: 'pending',
      items: selectedItems.map(c => ({
        description: `${c.system} Connector - ${c.pin_count || '?'} pins`,
        quantity: 1,
        unit_price: 0,
        total: 0
      })),
      client_notes: notes
    });

    setSelectedItems([]);
    setShowQuoteModal(false);
    navigate(createPageUrl('ClientQuotes'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
          <KGButton variant="ghost" onClick={() => navigate(createPageUrl('ClientDashboard'))}>
            <ArrowLeft size={20} />
          </KGButton>
          <div className="flex items-center gap-2">
            <Car size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-[#00c600]">{vehicle.vehicle_id}</h1>
          </div>
        </div>

      {/* Vehicle Info Card */}
      <KGCard className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {vehicle.photos?.length > 0 && (
              <div className="w-full md:w-48 h-36 rounded-lg overflow-hidden border border-gray-200">
                <img src={vehicle.photos[0]} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <KGCardTitle>{vehicle.year} {vehicle.make} {vehicle.model}</KGCardTitle>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                {vehicle.vin && <div><span className="text-gray-500">VIN:</span> {vehicle.vin}</div>}
                {vehicle.trim && <div><span className="text-gray-500">Trim:</span> {vehicle.trim}</div>}
                {vehicle.engine && <div><span className="text-gray-500">Engine:</span> {vehicle.engine}</div>}
                {vehicle.transmission && <div><span className="text-gray-500">Transmission:</span> {vehicle.transmission}</div>}
                {vehicle.body_type && <div><span className="text-gray-500">Body:</span> {vehicle.body_type}</div>}
                {vehicle.color && <div><span className="text-gray-500">Color:</span> {vehicle.color}</div>}
              </div>
              {vehicle.notes && <p className="text-sm text-gray-600 mt-4">{vehicle.notes}</p>}
            </div>
          </div>
      </KGCard>

      {/* Connectors Section */}
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plug size={20} className="text-[#00C600]" />
            <h2 className="text-lg text-gray-800">Connectors</h2>
          </div>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <KGButton variant="outline" onClick={() => setShowQuoteModal(true)}>
                <Send size={16} className="mr-2" />
                Request Quote ({selectedItems.length})
              </KGButton>
            )}
            <KGButton onClick={() => setShowConnectorModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Connector
            </KGButton>
          </div>
      </div>

      {connectors.length === 0 ? (
        <KGCard className="text-center py-8">
            <Plug size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No connectors added yet</p>
        </KGCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connectors.map((conn) => {
              const isSelected = selectedItems.find(i => i.id === conn.id);
              return (
                <KGCard 
                  key={conn.id} 
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-[#00C600] bg-[#00C600]/5' : ''}`}
                  onClick={() => toggleItemSelection(conn)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[#00C600] text-sm">{conn.connector_id}</span>
                    <input 
                      type="checkbox" 
                      checked={!!isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 accent-[#00C600]"
                    />
                  </div>
                  
                  {conn.photos?.length > 0 && (
                    <div className="grid grid-cols-3 gap-1 mb-3">
                      {conn.photos.slice(0, 3).map((p, i) => (
                        <div key={i} className="h-16 rounded overflow-hidden border border-gray-200">
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm font-normal text-gray-800">{conn.system}</p>
                  <div className="flex gap-2 mt-2 text-xs text-gray-500">
                    {conn.color && <span>{conn.color}</span>}
                    {conn.pin_count && <span>{conn.pin_count} pins</span>}
                  </div>
                </KGCard>
              );
            })}
        </div>
      )}

      {/* Add Connector Modal */}
      <Dialog open={showConnectorModal} onOpenChange={setShowConnectorModal}>
        <DialogContent className="max-w-[400px] bg-[#212121] border border-[#00c600]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Connector</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <input type="text" placeholder="e.g. ABS" value={connectorForm.system} onChange={(e) => setConnectorForm({ ...connectorForm, system: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. Black" value={connectorForm.color} onChange={(e) => setConnectorForm({ ...connectorForm, color: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. 16" value={connectorForm.pin_count} onChange={(e) => setConnectorForm({ ...connectorForm, pin_count: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <div>
              <label className="text-sm text-gray-400 block mb-1">Front View</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                {uploading ? <Loader2 className="animate-spin text-[#00c600]" size={16} /> : <span className="text-sm text-gray-400">Click to upload</span>}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} />
              </label>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Side View (Lever)</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} />
              </label>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">ECU Front (Part Number)</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} />
              </label>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Electrical Scheme</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} />
              </label>
            </div>
            <textarea placeholder="e.g. sensor list, actuator list" value={connectorForm.functions} onChange={(e) => setConnectorForm({ ...connectorForm, functions: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" rows="3"></textarea>
            <div className="flex gap-2 pt-2 border-t border-[#00c600]">
              <button onClick={() => setShowConnectorModal(false)} className="flex-1 p-2 border border-[#00c600] text-gray-400 rounded text-sm hover:opacity-80">Cancel</button>
              <button onClick={saveConnector} className="flex-1 bg-[#00c600] text-white p-2 rounded text-sm hover:opacity-80">Save Connector</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote Request Modal */}
      <QuoteRequestModal 
        open={showQuoteModal} 
        onClose={() => setShowQuoteModal(false)}
        items={selectedItems}
        onSubmit={sendQuoteRequest}
      />
    </div>
  );
}

function QuoteRequestModal({ open, onClose, items, onSubmit }) {
  const [notes, setNotes] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Parts Quote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-3 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Selected items:</p>
            {items.map((item, i) => (
              <div key={i} className="text-sm py-1">
                • {item.system} ({item.pin_count || '?'} pins)
              </div>
            ))}
          </div>

          <KGTextarea
            label="Additional Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific requirements or notes for this quote"
          />

          <div className="flex gap-3">
            <KGButton variant="outline" onClick={onClose}>Cancel</KGButton>
            <KGButton onClick={() => onSubmit(notes)} className="flex-1">
              <Send size={16} className="mr-2" />
              Send Request
            </KGButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}