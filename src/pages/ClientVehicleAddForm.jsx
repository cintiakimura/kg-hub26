import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function ClientVehicleAddForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    version: '',
    year: '',
    fuel: '',
    vin: '',
    engine_size: '',
    engine_power: '',
    engine_code: '',
    transmission: '',
    gears: ''
  });

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
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  };

  const decodeVIN = async () => {
    if (formData.vin.length < 17) {
      toast.error('VIN must be 17 characters');
      return;
    }

    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${formData.vin}?format=json`);
      const data = await response.json();
      
      if (data.Results && data.Results.length > 0) {
        const result = data.Results;
        const make = result.find(r => r.Variable === 'Make')?.Value || '';
        const model = result.find(r => r.Variable === 'Model')?.Value || '';
        const year = result.find(r => r.Variable === 'Model Year')?.Value || '';
        
        setFormData({
          ...formData,
          brand: make,
          model: model,
          year: year
        });
        toast.success('VIN decoded successfully');
      }
    } catch (err) {
      toast.error('Error decoding VIN');
    }
  };

  const saveVehicle = async () => {
    try {
      const vehicleId = `V-${Date.now()}`;
      
      await base44.entities.Vehicle.create({
        vehicle_id: vehicleId,
        org_id: userProfile.org_id,
        vin: formData.vin || '',
        make: formData.brand || '',
        model: formData.model || '',
        year: formData.year ? parseInt(formData.year) : null,
        trim: formData.version || '',
        engine: formData.engine_code || '',
        transmission: formData.transmission || '',
        color: '',
        notes: ''
      });

      toast.success('Vehicle created');
      navigate(createPageUrl(`VehicleConnectorAdd?vehicle_id=${vehicleId}`));
    } catch (err) {
      toast.error('Error creating vehicle');
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#212121] text-white">Loading...</div>;

  return (
    <div className="bg-[#212121] min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl text-[#00c600] font-normal">Create New Vehicle</h1>
        </div>

        <div className="border border-[#00c600] rounded p-6 bg-[#1e1e1e]">
          {/* New Vehicle Section */}
          <div className="mb-8">
            <h2 className="text-[#00c600] text-lg mb-6 font-normal">NEW VEHICLE</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm block mb-2">BRAND</label>
                <input 
                  type="text" 
                  placeholder="RENAULT"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">MODEL</label>
                <input 
                  type="text" 
                  placeholder="CAPTUR II"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">VERSION</label>
                <input 
                  type="text" 
                  placeholder="VERSION"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">YEAR</label>
                <input 
                  type="number" 
                  placeholder="2026"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">FUEL</label>
                <select 
                  value={formData.fuel}
                  onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                >
                  <option value="">Select fuel type</option>
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm block mb-2">VIN</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter 17-char VIN"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="flex-1 p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                  />
                  <button 
                    onClick={decodeVIN}
                    className="bg-[#00c600] text-black px-4 py-3 rounded font-normal text-sm hover:opacity-80 whitespace-nowrap"
                  >
                    DECODE
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white text-sm block mb-2">ENGINE SIZE</label>
                <input 
                  type="text" 
                  placeholder="1500cm3"
                  value={formData.engine_size}
                  onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">ENGINE POWER</label>
                <input 
                  type="text" 
                  placeholder="120PS"
                  value={formData.engine_power}
                  onChange={(e) => setFormData({ ...formData, engine_power: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">ENGINE CODE</label>
                <input 
                  type="text" 
                  placeholder="K9K"
                  value={formData.engine_code}
                  onChange={(e) => setFormData({ ...formData, engine_code: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">TRANSMISSION</label>
                <select 
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                >
                  <option value="">Select transmission</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm block mb-2">GEARS</label>
                <input 
                  type="text" 
                  placeholder="GEARS"
                  value={formData.gears}
                  onChange={(e) => setFormData({ ...formData, gears: e.target.value })}
                  className="w-full p-3 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-[#00c600] pt-6">
            <button 
              onClick={saveVehicle}
              className="w-full bg-[#00c600] text-black py-3 rounded font-normal text-sm hover:opacity-80"
            >
              + CREATE VEHICLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}