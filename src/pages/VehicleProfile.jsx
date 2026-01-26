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
        <div className="grid grid-cols-3 gap-6">
          {/* Vehicle Info */}
          <div className="col-span-1">
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

            {/* Photos Section */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Image size={20} color="#00c600" />
                  <h2 className="text-white text-lg">Photos</h2>
                </div>
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  <Plus size={20} color="#00c600" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {vehicle.photos?.map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-[#00c600]">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {(!vehicle.photos || vehicle.photos.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                    No photos uploaded
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connectors Section */}
          <div className="col-span-2">
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Plug size={20} color="#00c600" />
                  <h2 className="text-white text-lg">Connectors</h2>
                </div>
                <button
                  onClick={() => navigate(createPageUrl(`AddConnector?vehicle_id=${vehicle.vehicle_id}`))}
                  className="px-4 py-2 bg-[#00c600] text-black rounded hover:opacity-80 text-sm"
                >
                  + Add Connector
                </button>
              </div>

              {connectors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Plug size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No connectors added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {connectors.map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-[#00c600] hover:bg-[#252525] transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[#00c600] text-xs font-mono">{conn.connector_id}</span>
                      </div>

                      {conn.photos?.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 mb-3">
                          {conn.photos.slice(0, 3).map((photo, idx) => (
                            <div key={idx} className="aspect-square rounded overflow-hidden border border-[#00c600]">
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-white text-sm mb-2">{conn.system}</p>
                      <div className="flex gap-2 text-xs text-gray-400">
                        {conn.color && <span>{conn.color}</span>}
                        {conn.pin_count && <span>• {conn.pin_count} pins</span>}
                      </div>

                      {conn.scheme_url && (
                        <div className="mt-3 pt-3 border-t border-[#00c600]">
                          <a
                            href={conn.scheme_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#00c600] hover:underline flex items-center gap-1"
                          >
                            <FileText size={12} />
                            View Scheme
                          </a>
                        </div>
                      )}

                      {conn.functions && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{conn.functions}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600] mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={20} color="#00c600" />
                  <h2 className="text-white text-lg">Documents</h2>
                </div>
                <label className="cursor-pointer">
                  <input type="file" className="hidden" />
                  <Plus size={20} color="#00c600" />
                </label>
              </div>
              <div className="text-center py-8 text-gray-500 text-sm">
                No documents uploaded
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}