import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, FileText, Image, Plug, Upload, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function VehicleProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({});
  const [newConnector, setNewConnector] = useState({
    system: '',
    color: '',
    pin_count: '',
    scheme_url: '',
    functions: '',
    photos: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('vehicle_id');

    const user = await base44.auth.me();
    const profileData = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    setProfile(profileData);

    if (vehicleId) {
      const vehicleData = (await base44.entities.Vehicle.filter({ vehicle_id: vehicleId }))[0];
      setVehicle(vehicleData);
      setVehicleForm(vehicleData);

      const connectorData = await base44.entities.Connector.filter({ vehicle_id: vehicleId });
      setConnectors(connectorData);
    }

    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const currentPhotos = vehicle.photos || [];
    await base44.entities.Vehicle.update(vehicle.id, {
      photos: [...currentPhotos, file_url]
    });
    toast.success('Photo uploaded');
    loadData();
    setUploading(false);
  };

  const saveVehicle = async () => {
    try {
      await base44.entities.Vehicle.update(vehicle.id, vehicleForm);
      toast.success('Vehicle updated');
      setEditingVehicle(false);
      loadData();
    } catch (err) {
      toast.error('Error updating vehicle');
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    if (field === 'scheme') {
      setNewConnector({ ...newConnector, scheme_url: file_url });
    } else if (field === 'functions') {
      setNewConnector({ ...newConnector, functions: file_url });
    } else {
      const currentPhotos = newConnector.photos || [];
      setNewConnector({ ...newConnector, photos: [...currentPhotos, file_url] });
    }
    
    setUploading(false);
    toast.success('File uploaded');
  };

  const saveConnector = async () => {
    try {
      const connectorId = `CON-${Date.now()}`;
      await base44.entities.Connector.create({
        connector_id: connectorId,
        vehicle_id: vehicle.vehicle_id,
        org_id: profile.org_id,
        system: newConnector.system,
        color: newConnector.color,
        pin_count: newConnector.pin_count ? parseInt(newConnector.pin_count) : null,
        photos: newConnector.photos,
        scheme_url: newConnector.scheme_url,
        functions: newConnector.functions
      });
      toast.success('Connector saved');
      setNewConnector({
        system: '',
        color: '',
        pin_count: '',
        scheme_url: '',
        functions: '',
        photos: []
      });
      loadData();
    } catch (err) {
      toast.error('Error saving connector');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  if (!vehicle) return <div className="flex items-center justify-center h-screen text-white">Vehicle not found</div>;

  return (
    <div className="bg-[#212121] min-h-screen ml-16">
      <div className="bg-[#212121] flex items-center justify-between px-6" style={{ height: '120px', width: '100%' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(createPageUrl('ClientDashboard'))} className="hover:opacity-70">
            <ArrowLeft size={24} color="#00c600" />
          </button>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '400' }}>
            {vehicle.make} {vehicle.model} {vehicle.year}
          </h1>
          <span className="px-3 py-1 bg-[#00c600] bg-opacity-20 border border-[#00c600] text-[#00c600] text-xs rounded">
            {vehicle.vehicle_id}
          </span>
        </div>
      </div>

      <div className="px-6 py-6" style={{ width: '100%', maxWidth: '1400px' }}>
        <div className="grid grid-cols-1 gap-6">
          {/* Vehicle Info */}
          <div>
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600] mb-6 relative">
              <button
                onClick={() => setEditingVehicle(!editingVehicle)}
                className="absolute top-4 right-4 p-2 hover:bg-[#00c600] hover:bg-opacity-20 rounded transition-all"
              >
                <Edit size={16} color="#00c600" />
              </button>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-xs mb-2 block">BRAND</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.make || '') : (vehicle.make || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">MODEL</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.model || '') : (vehicle.model || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">VERSION</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.trim || '') : (vehicle.trim || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, trim: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">YEAR</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.year || '') : (vehicle.year || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">FUEL</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.body_type || '') : (vehicle.body_type || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, body_type: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">VIN</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.vin || '') : (vehicle.vin || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">ENGINE SIZE</label>
                  <input
                    type="text"
                    value=""
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">ENGINE POWER</label>
                  <input
                    type="text"
                    value=""
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">ENGINE CODE</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.engine || '') : (vehicle.engine || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, engine: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">TRANSMISSION</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.transmission || '') : (vehicle.transmission || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, transmission: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">GEARS</label>
                  <input
                    type="text"
                    value={editingVehicle ? (vehicleForm.notes || '') : (vehicle.notes || '')}
                    onChange={(e) => editingVehicle && setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                    readOnly={!editingVehicle}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
              </div>
              {editingVehicle && (
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#00c600]">
                  <button
                    onClick={() => {
                      setEditingVehicle(false);
                      setVehicleForm(vehicle);
                    }}
                    className="px-4 py-2 border border-[#00c600] text-[#00c600] rounded text-sm hover:opacity-80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveVehicle}
                    className="px-4 py-2 bg-[#00c600] text-black rounded text-sm hover:opacity-80"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add New Connector Section */}
          <div>
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600]">
              <h2 className="text-white text-sm mb-6">ADD NEW CONNECTOR</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-white text-xs mb-2 block">CALCULATOR SYSTEM</label>
                  <input
                    type="text"
                    placeholder="e.g. ABS"
                    value={newConnector.system}
                    onChange={(e) => setNewConnector({ ...newConnector, system: e.target.value })}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">CONNECTOR COLOR</label>
                  <input
                    type="text"
                    placeholder="e.g. Black"
                    value={newConnector.color}
                    onChange={(e) => setNewConnector({ ...newConnector, color: e.target.value })}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="text-white text-xs mb-2 block">PIN QUANTITY</label>
                <input
                  type="text"
                  placeholder="e.g. 16"
                  value={newConnector.pin_count}
                  onChange={(e) => setNewConnector({ ...newConnector, pin_count: e.target.value })}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  style={{ maxWidth: '50%' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-white text-xs mb-2 block">ELECTRICAL SCHEME</label>
                  <p className="text-gray-400 text-xs mb-2">Upload Scheme</p>
                  <label className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a] cursor-pointer block">
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'scheme')}
                      className="hidden"
                    />
                    <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">{newConnector.scheme_url ? 'File uploaded ✓' : 'Click to upload'}</p>
                  </label>
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">LIST OF FUNCTIONS</label>
                  <p className="text-gray-400 text-xs mb-2">Upload Functions List</p>
                  <label className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a] cursor-pointer block">
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'functions')}
                      className="hidden"
                    />
                    <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">{newConnector.functions ? 'File uploaded ✓' : 'Click to upload'}</p>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-white text-xs mb-4">CONNECTOR IMAGES</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">FRONT VIEW</label>
                    <p className="text-white text-sm mb-2">Front View</p>
                    <label className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a] cursor-pointer block">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photo')}
                        className="hidden"
                      />
                      <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-xs">{newConnector.photos.length > 0 ? `${newConnector.photos.length} uploaded` : 'Click to upload'}</p>
                    </label>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">VIEW (LEVER)</label>
                    <p className="text-white text-sm mb-2">View (Lever)</p>
                    <label className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a] cursor-pointer block">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photo')}
                        className="hidden"
                      />
                      <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-xs">{newConnector.photos.length > 1 ? `${newConnector.photos.length} uploaded` : 'Click to upload'}</p>
                    </label>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">ECU FRONT (PART NUMBER)</label>
                    <p className="text-white text-sm mb-2">Add ECU Image</p>
                    <label className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a] cursor-pointer block">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photo')}
                        className="hidden"
                      />
                      <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-xs">{newConnector.photos.length > 2 ? `${newConnector.photos.length} uploaded` : 'Click to upload'}</p>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={saveConnector}
                  disabled={uploading || !newConnector.system}
                  className="px-8 py-3 bg-[#00c600] text-black rounded hover:opacity-80 text-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : '+ SAVE CONNECTOR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}