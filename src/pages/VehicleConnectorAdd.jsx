import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Upload, Plus } from 'lucide-react';

export default function VehicleConnectorAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    system: '',
    color: '',
    pin_count: '',
    scheme_url: '',
    functions: '',
    photos: []
  });
  const [ecuPhotos, setEcuPhotos] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      const profile = profiles[0];

      if (!profile) {
        navigate(createPageUrl('ClientLogin'));
        return;
      }

      setUserProfile(profile);

      const params = new URLSearchParams(window.location.search);
      const vehicleId = params.get('vehicle_id');

      if (vehicleId) {
        const vehicles = await base44.entities.Vehicle.filter({ org_id: profile.org_id });
        const foundVehicle = vehicles.find(v => v.id === vehicleId);
        setVehicle(foundVehicle);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        const newPhotos = [...formData.photos];
        newPhotos[index] = url;
        setFormData({ ...formData, photos: newPhotos });
      }
    }
  };

  const handleEcuPhotoUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        const newPhotos = [...ecuPhotos];
        newPhotos[index] = url;
        setEcuPhotos(newPhotos);
      }
    }
  };

  const handleSchemeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        setFormData({ ...formData, scheme_url: url });
      }
    }
  };

  const handleFunctionsUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        setFormData({ ...formData, functions: url });
      }
    }
  };

  const addEcuPhoto = () => {
    setEcuPhotos([...ecuPhotos, null]);
  };

  const saveConnector = async () => {
    try {
      const allPhotos = [
        formData.photos[0] || null,
        formData.photos[1] || null,
        formData.photos[2] || null,
        ...ecuPhotos.filter(p => p)
      ].filter(p => p);

      await base44.entities.Connector.create({
        connector_id: `CON-${Date.now()}`,
        vehicle_id: vehicle.id,
        org_id: userProfile.org_id,
        system: formData.system || '',
        color: formData.color || '',
        pin_count: parseInt(formData.pin_count) || 0,
        scheme_url: formData.scheme_url || '',
        functions: formData.functions || '',
        photos: allPhotos
      });

      toast.success('Connector saved');
      navigate(createPageUrl(`ClientVehicleDetail?vehicle_id=${vehicle.id}`));
    } catch (err) {
      toast.error('Error saving connector');
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#212121] text-white">Loading...</div>;
  if (!vehicle) return <div className="flex items-center justify-center h-screen bg-[#212121] text-white">Vehicle not found</div>;

  return (
    <div className="bg-[#212121] min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl text-[#00c600] font-normal">SSSSS - CONNECTORS</h1>
            <span className="px-3 py-1 bg-[#00c600] text-black text-sm rounded">{vehicle.vehicle_id}</span>
            <span className="text-white text-sm">{vehicle.model || 'Vehicle'}</span>
          </div>
          <button 
            onClick={saveConnector}
            className="bg-[#00c600] text-white px-6 py-2 rounded font-normal text-sm hover:opacity-80"
          >
            SAVE & FINISH
          </button>
        </div>

        <div className="border border-[#00c600] rounded p-6 bg-[#1e1e1e]">
          {/* Add New Connector Section */}
          <div className="mb-8">
            <h2 className="text-[#00c600] text-lg mb-6 font-normal">ADD NEW CONNECTOR</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm block mb-2">CALCULATOR SYSTEM</label>
                <input 
                  type="text" 
                  placeholder="e.g. ABS"
                  value={formData.system}
                  onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">CONNECTOR COLOR</label>
                <input 
                  type="text" 
                  placeholder="e.g. Black"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">PIN QUANTITY</label>
                <input 
                  type="number" 
                  placeholder="e.g. 16"
                  value={formData.pin_count}
                  onChange={(e) => setFormData({ ...formData, pin_count: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Electrical Scheme & Functions */}
          <div className="mb-8">
            <h2 className="text-[#00c600] text-lg mb-6 font-normal">ELECTRICAL SCHEME & LIST OF FUNCTIONS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm block mb-2">Upload Scheme</label>
                <label className="border border-[#00c600] rounded p-6 bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition flex items-center justify-center min-h-32">
                  <div className="text-center">
                    <Upload size={24} className="text-[#00c600] mx-auto mb-2" />
                    <span className="text-white text-sm">Click to upload</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={handleSchemeUpload}
                    className="hidden"
                  />
                </label>
                {formData.scheme_url && <p className="text-[#00c600] text-xs mt-2">✓ File uploaded</p>}
              </div>
              <div>
                <label className="text-white text-sm block mb-2">Upload Functions List</label>
                <label className="border border-[#00c600] rounded p-6 bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition flex items-center justify-center min-h-32">
                  <div className="text-center">
                    <Upload size={24} className="text-[#00c600] mx-auto mb-2" />
                    <span className="text-white text-sm">Click to upload</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={handleFunctionsUpload}
                    className="hidden"
                  />
                </label>
                {formData.functions && <p className="text-[#00c600] text-xs mt-2">✓ File uploaded</p>}
              </div>
            </div>
          </div>

          {/* Connector Images */}
          <div className="mb-8">
            <h2 className="text-[#00c600] text-lg mb-6 font-normal">CONNECTOR IMAGES</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-white text-sm block mb-2">FRONT VIEW</label>
                <label className="border border-[#00c600] rounded p-6 bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition flex items-center justify-center min-h-32">
                  <div className="text-center">
                    <Upload size={24} className="text-[#00c600] mx-auto mb-2" />
                    <span className="text-white text-sm">Click to upload</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => handlePhotoUpload(e, 0)}
                    className="hidden"
                  />
                </label>
                {formData.photos[0] && <p className="text-[#00c600] text-xs mt-2">✓ Uploaded</p>}
              </div>
              <div>
                <label className="text-white text-sm block mb-2">VIEW (LEVER)</label>
                <label className="border border-[#00c600] rounded p-6 bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition flex items-center justify-center min-h-32">
                  <div className="text-center">
                    <Upload size={24} className="text-[#00c600] mx-auto mb-2" />
                    <span className="text-white text-sm">Click to upload</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => handlePhotoUpload(e, 1)}
                    className="hidden"
                  />
                </label>
                {formData.photos[1] && <p className="text-[#00c600] text-xs mt-2">✓ Uploaded</p>}
              </div>
              <div>
                <label className="text-white text-sm block mb-2">ECU FRONT (PART NUMBER)</label>
                <label className="border border-[#00c600] rounded p-6 bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition flex items-center justify-center min-h-32">
                  <div className="text-center">
                    <Upload size={24} className="text-[#00c600] mx-auto mb-2" />
                    <span className="text-white text-sm">Click to upload</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => handlePhotoUpload(e, 2)}
                    className="hidden"
                  />
                </label>
                {formData.photos[2] && <p className="text-[#00c600] text-xs mt-2">✓ Uploaded</p>}
              </div>
            </div>

            {/* Additional ECU Images */}
            {ecuPhotos.map((_, idx) => (
              <div key={idx} className="mb-4">
                <label className="text-white text-sm block mb-2">ECU IMAGE {idx + 1}</label>
                <label className="border border-[#00c600] rounded p-6 bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition flex items-center justify-center min-h-32">
                  <div className="text-center">
                    <Upload size={24} className="text-[#00c600] mx-auto mb-2" />
                    <span className="text-white text-sm">Click to upload</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => handleEcuPhotoUpload(e, idx)}
                    className="hidden"
                  />
                </label>
                {ecuPhotos[idx] && <p className="text-[#00c600] text-xs mt-2">✓ Uploaded</p>}
              </div>
            ))}

            <button 
              onClick={addEcuPhoto}
              className="text-[#00c600] text-sm font-normal flex items-center gap-1 hover:opacity-80"
            >
              <Plus size={16} /> Add ECU Image
            </button>
          </div>

          {/* Save Button */}
          <div className="border-t border-[#00c600] pt-6">
            <button 
              onClick={saveConnector}
              className="w-full bg-[#00c600] text-white py-3 rounded font-normal text-sm hover:opacity-80"
            >
              + SAVE CONNECTOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}