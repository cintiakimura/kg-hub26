import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VehicleDetail() {
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newConnector, setNewConnector] = useState({
    system: '',
    color: '',
    pin_count: '',
    front_view: '',
    side_view: '',
    ecu_front: '',
    ecu_showing_pn: '',
    extra_photos: [],
    scheme_url: '',
    functions: ''
  });
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const profile = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    
    if (!profile) {
      navigate(createPageUrl('Login'));
      return;
    }
    
    setUserProfile(profile);

    const vehicles = await base44.entities.Vehicle.filter({ vehicle_id: vehicleId });
    const veh = vehicles[0];

    if (!veh) {
      toast.error('Vehicle not found');
      navigate(-1);
      return;
    }

    if (veh.org_id !== profile.org_id) {
      toast.error('Not your vehicle');
      navigate(-1);
      return;
    }

    setVehicle(veh);

    const conns = await base44.entities.Connector.filter({ vehicle_id: vehicleId });
    setConnectors(conns);

    setLoading(false);
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    if (field === 'extra_photos') {
      setNewConnector({ ...newConnector, extra_photos: [...newConnector.extra_photos, file_url] });
    } else {
      setNewConnector({ ...newConnector, [field]: file_url });
    }
    setUploading(false);
  };

  const saveConnector = async () => {
    const connId = `CON-${Date.now()}`;
    await base44.entities.Connector.create({
      connector_id: connId,
      vehicle_id: vehicleId,
      org_id: userProfile.org_id,
      system: newConnector.system,
      color: newConnector.color,
      pin_count: newConnector.pin_count ? parseInt(newConnector.pin_count) : null,
      photos: [
        newConnector.front_view,
        newConnector.side_view,
        newConnector.ecu_front,
        newConnector.ecu_showing_pn,
        ...newConnector.extra_photos
      ].filter(p => p),
      scheme_url: newConnector.scheme_url,
      functions: newConnector.functions
    });

    toast.success('Connector saved');
    setShowAddModal(false);
    setNewConnector({
      system: '',
      color: '',
      pin_count: '',
      front_view: '',
      side_view: '',
      ecu_front: '',
      ecu_showing_pn: '',
      extra_photos: [],
      scheme_url: '',
      functions: ''
    });
    loadData();
  };

  const deleteConnector = async (connId) => {
    if (confirm('Delete this connector?')) {
      await base44.entities.Connector.delete(connId);
      toast.success('Connector deleted');
      loadData();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#00c600] hover:bg-opacity-20 rounded transition-all">
            <ArrowLeft size={20} color="#00c600" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-[#00c600]">Vehicle</h1>
            <span className="bg-[#00c600] text-black px-3 py-1 rounded text-sm">{vehicle.vehicle_id}</span>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#00c600] text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={16} />
          Add Connector
        </button>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#00c600]">
        <h2 className="text-lg text-[#00c600] mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-400">Brand:</span> <span className="text-white ml-2">{vehicle.make || '-'}</span></div>
          <div><span className="text-gray-400">Model:</span> <span className="text-white ml-2">{vehicle.model || '-'}</span></div>
          <div><span className="text-gray-400">Year:</span> <span className="text-white ml-2">{vehicle.year || '-'}</span></div>
          <div><span className="text-gray-400">VIN:</span> <span className="text-white ml-2">{vehicle.vin || '-'}</span></div>
          <div><span className="text-gray-400">Engine Code:</span> <span className="text-white ml-2">{vehicle.engine || '-'}</span></div>
          <div><span className="text-gray-400">Transmission:</span> <span className="text-white ml-2">{vehicle.transmission || '-'}</span></div>
          <div><span className="text-gray-400">Body Type:</span> <span className="text-white ml-2">{vehicle.body_type || '-'}</span></div>
          <div><span className="text-gray-400">Color:</span> <span className="text-white ml-2">{vehicle.color || '-'}</span></div>
        </div>

        {vehicle.photos?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm text-gray-400 mb-2">Photos</h3>
            <div className="grid grid-cols-4 gap-2">
              {vehicle.photos.map((photo, i) => (
                <img key={i} src={photo} alt="" className="w-full h-24 object-cover rounded border border-[#00c600]" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600]">
        <h2 className="text-lg text-[#00c600] mb-4">Connectors</h2>
        {connectors.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No connectors added yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((conn) => (
              <div key={conn.id} className="bg-[#212121] rounded-lg p-4 border border-[#00c600] relative">
                <button onClick={() => deleteConnector(conn.id)} className="absolute top-2 right-2 p-1 hover:bg-red-600 rounded transition-all">
                  <Trash2 size={14} color="#ff4444" />
                </button>
                <div className="mb-2">
                  <span className="text-[#00c600] text-sm font-bold">{conn.connector_id}</span>
                </div>
                <div className="text-sm space-y-1 mb-3">
                  <div><span className="text-gray-400">System:</span> <span className="text-white ml-1">{conn.system || '-'}</span></div>
                  <div><span className="text-gray-400">Color:</span> <span className="text-white ml-1">{conn.color || '-'}</span></div>
                  <div><span className="text-gray-400">Pins:</span> <span className="text-white ml-1">{conn.pin_count || '-'}</span></div>
                </div>
                {conn.photos?.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {conn.photos.slice(0, 3).map((photo, i) => (
                      <img key={i} src={photo} alt="" className="w-full h-16 object-cover rounded border border-[#00c600]" />
                    ))}
                  </div>
                )}
                {conn.scheme_url && (
                  <a href={conn.scheme_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00c600] block mt-2 hover:underline">
                    View Scheme
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[400px] bg-[#212121] border border-[#00c600]">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Connector</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <input type="text" placeholder="e.g. ABS" value={newConnector.system} onChange={(e) => setNewConnector({ ...newConnector, system: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. Black" value={newConnector.color} onChange={(e) => setNewConnector({ ...newConnector, color: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. 16" value={newConnector.pin_count} onChange={(e) => setNewConnector({ ...newConnector, pin_count: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            
            <div>
              <label className="text-sm text-gray-400 block mb-1">Front View</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                {uploading ? <Loader2 className="animate-spin text-[#00c600]" size={16} /> : <span className="text-sm text-gray-400">Click to upload</span>}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'front_view')} />
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Side View (Lever)</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'side_view')} />
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">ECU Front (Part Number)</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ecu_front')} />
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">ECU Showing PN</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ecu_showing_pn')} />
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Additional Photos</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload more</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'extra_photos')} />
              </label>
              {newConnector.extra_photos.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">{newConnector.extra_photos.length} extra photo(s) uploaded</div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Electrical Scheme</label>
              <label className="w-full h-16 border-2 border-dashed border-[#00c600] rounded flex items-center justify-center cursor-pointer bg-[#2a2a2a] hover:bg-[#333]">
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'scheme_url')} />
              </label>
            </div>

            <textarea placeholder="e.g. sensor list, actuator list" value={newConnector.functions} onChange={(e) => setNewConnector({ ...newConnector, functions: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" rows="3"></textarea>
            
            <div className="flex gap-2 pt-2 border-t border-[#00c600]">
              <button onClick={() => setShowAddModal(false)} className="flex-1 p-2 border border-[#00c600] text-gray-400 rounded text-sm hover:opacity-80">Cancel</button>
              <button onClick={saveConnector} className="flex-1 bg-[#00c600] text-white p-2 rounded text-sm hover:opacity-80">Save Connector</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}