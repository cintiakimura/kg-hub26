import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function AddVehicle() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
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
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profileData = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    setProfile(profileData);
  };

  const generateVehicleId = async () => {
    const clientId = profile.org_id;
    const vehicles = await base44.entities.Vehicle.filter({ org_id: clientId });
    const vehicleCount = vehicles.length + 1;
    return `${clientId}V${String(vehicleCount).padStart(3, '0')}`;
  };

  const decodeVIN = async () => {
    if (form.vin.length < 17) {
      toast.error('VIN must be 17 characters');
      return;
    }
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${form.vin}?format=json`);
      const data = await response.json();
      if (data.Results) {
        const result = data.Results;
        const make = result.find(r => r.Variable === 'Make')?.Value || '';
        const model = result.find(r => r.Variable === 'Model')?.Value || '';
        const year = result.find(r => r.Variable === 'Model Year')?.Value || '';
        setForm({ ...form, brand: make, model, year });
        toast.success('VIN decoded');
      }
    } catch {
      toast.error('Error decoding VIN');
    }
  };

  const handleSave = async () => {
    const vehicleId = await generateVehicleId();
    await base44.entities.Vehicle.create({
      vehicle_id: vehicleId,
      org_id: profile.org_id,
      make: form.brand,
      model: form.model,
      year: form.year ? parseInt(form.year) : null,
      trim: form.version,
      engine: form.engine_code,
      transmission: form.transmission,
      vin: form.vin,
      body_type: '',
      color: '',
      notes: ''
    });
    toast.success('Vehicle added');
    navigate(createPageUrl('ClientDashboard'));
  };

  return (
    <div className="bg-[#212121] min-h-screen ml-16">
      <div className="bg-[#212121] flex items-center justify-between px-6" style={{ height: '120px', width: '100%' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(createPageUrl('ClientDashboard'))} className="hover:opacity-70">
            <ArrowLeft size={24} color="#00c600" />
          </button>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '400' }}>Create New Vehicle</h1>
        </div>
      </div>
      
      <div className="px-6 py-6" style={{ width: '100%' }}>
        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#00c600]">
          <h2 className="text-white text-lg mb-6">NEW VEHICLE</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-white text-sm mb-2 block">BRAND</label>
              <input
                type="text"
                placeholder="e.g. RENAULT"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">MODEL</label>
              <input
                type="text"
                placeholder="e.g. CAPTUR II"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">VERSION</label>
              <input
                type="text"
                placeholder="e.g. Intens"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">YEAR</label>
              <input
                type="text"
                placeholder="e.g. 2026"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">FUEL</label>
              <select
                value={form.fuel}
                onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              >
                <option value="">Select fuel type</option>
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">VIN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 17-char VIN"
                  value={form.vin}
                  onChange={(e) => setForm({ ...form, vin: e.target.value })}
                  className="flex-1 p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
                />
                <button
                  onClick={decodeVIN}
                  className="px-4 bg-[#00c600] text-black rounded text-sm hover:opacity-80"
                >
                  DECODE
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">ENGINE SIZE</label>
              <input
                type="text"
                placeholder="e.g. 1500cm3"
                value={form.engine_size}
                onChange={(e) => setForm({ ...form, engine_size: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">ENGINE POWER</label>
              <input
                type="text"
                placeholder="e.g. 120PS"
                value={form.engine_power}
                onChange={(e) => setForm({ ...form, engine_power: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">ENGINE CODE</label>
              <input
                type="text"
                placeholder="e.g. K9K"
                value={form.engine_code}
                onChange={(e) => setForm({ ...form, engine_code: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">TRANSMISSION</label>
              <select
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              >
                <option value="">Select transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">GEARS</label>
              <input
                type="text"
                placeholder="e.g. 6"
                value={form.gears}
                onChange={(e) => setForm({ ...form, gears: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#00c600] rounded text-white text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => navigate(createPageUrl('ClientDashboard'))}
              className="px-6 py-3 border border-[#00c600] text-white rounded hover:opacity-80"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#00c600] text-black rounded hover:opacity-80"
            >
              SAVE & CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}