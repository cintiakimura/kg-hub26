import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';

export default function AddConnector() {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    system: '',
    color: '',
    pin_count: '',
    scheme_url: '',
    functions_url: '',
    front_view: '',
    lever_view: '',
    ecu_front: ''
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
    }
  };

  const generateConnectorId = async () => {
    if (!vehicle) return '';
    const connectors = await base44.entities.Connector.filter({ vehicle_id: vehicle.vehicle_id });
    const connectorCount = connectors.length + 1;
    return `${vehicle.vehicle_id}P${String(connectorCount).padStart(3, '0')}`;
  };

  const handleFileUpload = async (file, field) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, [field]: file_url });
    setUploading(false);
  };

  const handleSave = async () => {
    const connectorId = await generateConnectorId();
    await base44.entities.Connector.create({
      connector_id: connectorId,
      vehicle_id: vehicle.vehicle_id,
      org_id: profile.org_id,
      system: form.system,
      color: form.color,
      pin_count: form.pin_count ? parseInt(form.pin_count) : null,
      scheme_url: form.scheme_url,
      functions: form.functions_url,
      photos: [form.front_view, form.lever_view, form.ecu_front].filter(Boolean)
    });
    toast.success('Connector added');
    navigate(createPageUrl(`ClientVehicleDetail?id=${vehicle.id}`));
  };

  if (!vehicle) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  return (
    <div className="bg-[#212121] min-h-screen ml-16">
      <div className="bg-[#212121] flex items-center justify-between px-6" style={{ height: '120px', width: '100%' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(createPageUrl(`ClientVehicleDetail?id=${vehicle.id}`))} className="hover:opacity-70">
            <ArrowLeft size={24} color="#00c600" />
          </button>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '400' }}>{vehicle.vehicle_id} - CONNECTORS</h1>
          <span className="px-3 py-1 bg-[#00c600] bg-opacity-20 border border-[#00c600] text-[#00c600] text-xs rounded">
            VEH-{vehicle.vehicle_id}
          </span>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#00c600] text-black rounded hover:opacity-80"
        >
          SAVE & FINISH
        </button>
      </div>
      
      <div className="px-6 py-6" style={{ width: '100%' }}>
        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600]">
          <h2 className="text-white text-lg mb-6">ADD NEW CONNECTOR</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-white text-sm mb-2 block">CALCULATOR SYSTEM</label>
              <input
                type="text"
                placeholder="e.g. ABS"
                value={form.system}
                onChange={(e) => setForm({ ...form, system: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">CONNECTOR COLOR</label>
              <input
                type="text"
                placeholder="e.g. Black"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="text-white text-sm mb-2 block">PIN QUANTITY</label>
            <input
              type="text"
              placeholder="e.g. 16"
              value={form.pin_count}
              onChange={(e) => setForm({ ...form, pin_count: e.target.value })}
              className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              style={{ maxWidth: '50%' }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-white text-sm mb-2 block">ELECTRICAL SCHEME</label>
              <p className="text-gray-400 text-xs mb-2">Upload Scheme</p>
              <div className="border-2 border-dashed border-[#00c600] rounded-lg p-8 text-center bg-[#1a1a1a]">
                <input
                  type="file"
                  id="scheme"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'scheme_url')}
                />
                <label htmlFor="scheme" className="cursor-pointer">
                  <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400 text-sm">{form.scheme_url ? 'Uploaded' : 'Click to upload'}</p>
                </label>
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">LIST OF FUNCTIONS</label>
              <p className="text-gray-400 text-xs mb-2">Upload Functions List</p>
              <div className="border-2 border-dashed border-[#00c600] rounded-lg p-8 text-center bg-[#1a1a1a]">
                <input
                  type="file"
                  id="functions"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'functions_url')}
                />
                <label htmlFor="functions" className="cursor-pointer">
                  <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400 text-sm">{form.functions_url ? 'Uploaded' : 'Click to upload'}</p>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-white text-sm mb-4">CONNECTOR IMAGES</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-gray-400 text-xs mb-2 block">FRONT VIEW</label>
                <p className="text-white text-sm mb-2">Front View</p>
                <div className="border-2 border-dashed border-[#00c600] rounded-lg p-8 text-center bg-[#1a1a1a]">
                  <input
                    type="file"
                    id="front"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'front_view')}
                  />
                  <label htmlFor="front" className="cursor-pointer">
                    <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-xs">{form.front_view ? 'Uploaded' : 'Click to upload'}</p>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-xs mb-2 block">VIEW (LEVER)</label>
                <p className="text-white text-sm mb-2">View (Lever)</p>
                <div className="border-2 border-dashed border-[#00c600] rounded-lg p-8 text-center bg-[#1a1a1a]">
                  <input
                    type="file"
                    id="lever"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'lever_view')}
                  />
                  <label htmlFor="lever" className="cursor-pointer">
                    <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-xs">{form.lever_view ? 'Uploaded' : 'Click to upload'}</p>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-xs mb-2 block">ECU FRONT (PART NUMBER)</label>
                <p className="text-white text-sm mb-2">Add ECU Image</p>
                <div className="border-2 border-dashed border-[#00c600] rounded-lg p-8 text-center bg-[#1a1a1a]">
                  <input
                    type="file"
                    id="ecu"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'ecu_front')}
                  />
                  <label htmlFor="ecu" className="cursor-pointer">
                    <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-xs">{form.ecu_front ? 'Uploaded' : 'Click to upload'}</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-6 py-3 bg-[#00c600] text-black rounded hover:opacity-80 disabled:opacity-50"
            >
              {uploading ? 'UPLOADING...' : 'SAVE CONNECTOR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}