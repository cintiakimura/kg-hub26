import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, FileText, Image, Plug, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function VehicleProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600] mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-xs mb-2 block">BRAND</label>
                  <input
                    type="text"
                    value={vehicle.make || ''}
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">MODEL</label>
                  <input
                    type="text"
                    value={vehicle.model || ''}
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">VERSION</label>
                  <input
                    type="text"
                    value={vehicle.trim || ''}
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">YEAR</label>
                  <input
                    type="text"
                    value={vehicle.year || ''}
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">FUEL</label>
                  <input
                    type="text"
                    value={vehicle.body_type || ''}
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">VIN</label>
                  <input
                    type="text"
                    value={vehicle.vin || ''}
                    readOnly
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
                    value={vehicle.engine || ''}
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">TRANSMISSION</label>
                  <input
                    type="text"
                    value={vehicle.transmission || ''}
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">GEARS</label>
                  <input
                    type="text"
                    value=""
                    readOnly
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
              </div>
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
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">CONNECTOR COLOR</label>
                  <input
                    type="text"
                    placeholder="e.g. Black"
                    className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="text-white text-xs mb-2 block">PIN QUANTITY</label>
                <input
                  type="text"
                  placeholder="e.g. 16"
                  className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                  style={{ maxWidth: '50%' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-white text-xs mb-2 block">ELECTRICAL SCHEME</label>
                  <p className="text-gray-400 text-xs mb-2">Upload Scheme</p>
                  <div className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a]">
                    <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">Click to upload</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-white text-xs mb-2 block">LIST OF FUNCTIONS</label>
                  <p className="text-gray-400 text-xs mb-2">Upload Functions List</p>
                  <div className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a]">
                    <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">Click to upload</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-white text-xs mb-4">CONNECTOR IMAGES</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">FRONT VIEW</label>
                    <p className="text-white text-sm mb-2">Front View</p>
                    <div className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a]">
                      <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-xs">Click to upload</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">VIEW (LEVER)</label>
                    <p className="text-white text-sm mb-2">View (Lever)</p>
                    <div className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a]">
                      <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-xs">Click to upload</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">ECU FRONT (PART NUMBER)</label>
                    <p className="text-white text-sm mb-2">Add ECU Image</p>
                    <div className="border-2 border-dashed border-[#00c600] rounded-lg p-12 text-center bg-[#1a1a1a]">
                      <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-xs">Click to upload</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  className="px-8 py-3 bg-[#00c600] text-black rounded hover:opacity-80 text-sm"
                >
                  + SAVE CONNECTOR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}