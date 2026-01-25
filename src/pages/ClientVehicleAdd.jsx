import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGInput, { KGTextarea, KGSelect } from '@/components/ui/KGInput';
import { Car, Search, Loader2, ArrowLeft, Upload, X } from 'lucide-react';

export default function ClientVehicleAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    trim: '',
    engine: '',
    transmission: '',
    body_type: '',
    color: '',
    photos: [],
    notes: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
    setLoading(false);
  };

  const decodeVIN = async () => {
    if (!form.vin || form.vin.length !== 17) return;
    setVinLoading(true);

    // Try NHTSA API first
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${form.vin}?format=json`);
    const data = await response.json();

    if (data.Results) {
      const getValue = (name) => {
        const item = data.Results.find(r => r.Variable === name);
        return item?.Value || '';
      };

      setForm(f => ({
        ...f,
        make: getValue('Make') || f.make,
        model: getValue('Model') || f.model,
        year: getValue('Model Year') || f.year,
        trim: getValue('Trim') || f.trim,
        engine: `${getValue('Displacement (L)')}L ${getValue('Engine Number of Cylinders')}cyl ${getValue('Fuel Type - Primary')}`.trim() || f.engine,
        transmission: getValue('Transmission Style') || f.transmission,
        body_type: getValue('Body Class') || f.body_type
      }));
    }

    setVinLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, photos: [...f.photos, file_url] }));
    }

    setUploading(false);
  };

  const removePhoto = (index) => {
    setForm(f => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index)
    }));
  };

  const generateVehicleId = async () => {
    const vehicles = await base44.entities.Vehicle.filter({ org_id: profile.org_id });
    const num = vehicles.length + 1;
    return `V-${String(num).padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const vehicleId = await generateVehicleId();

    await base44.entities.Vehicle.create({
      vehicle_id: vehicleId,
      org_id: profile.org_id,
      vin: form.vin,
      make: form.make,
      model: form.model,
      year: form.year ? parseInt(form.year) : null,
      trim: form.trim,
      engine: form.engine,
      transmission: form.transmission,
      body_type: form.body_type,
      color: form.color,
      photos: form.photos,
      notes: form.notes
    });

    navigate(createPageUrl('ClientDashboard'));
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
          <KGButton variant="ghost" onClick={() => navigate(createPageUrl('ClientDashboard'))}>
            <ArrowLeft size={20} />
          </KGButton>
          <div className="flex items-center gap-2">
            <Car size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-[#00c600]">Add Vehicle</h1>
          </div>
        </div>

      <KGCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* VIN Decode Section */}
            <div className="flex gap-2">
              <div className="flex-1">
                <KGInput
                  label="VIN (Vehicle Identification Number)"
                  value={form.vin}
                  onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                  placeholder="17-character VIN"
                  maxLength={17}
                />
              </div>
              <div className="flex items-end">
                <KGButton
                  type="button"
                  variant="outline"
                  onClick={decodeVIN}
                  disabled={vinLoading || form.vin.length !== 17}
                >
                  {vinLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                  <span className="ml-2">Decode</span>
                </KGButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <KGInput
                label="Make"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                placeholder="e.g., Toyota"
              />
              <KGInput
                label="Model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g., Camry"
              />
              <KGInput
                label="Year"
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="e.g., 2022"
              />
              <KGInput
                label="Trim"
                value={form.trim}
                onChange={(e) => setForm({ ...form, trim: e.target.value })}
                placeholder="e.g., XLE"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <KGInput
                label="Engine"
                value={form.engine}
                onChange={(e) => setForm({ ...form, engine: e.target.value })}
                placeholder="e.g., 2.5L 4cyl"
              />
              <KGInput
                label="Transmission"
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                placeholder="e.g., Automatic"
              />
              <KGInput
                label="Body Type"
                value={form.body_type}
                onChange={(e) => setForm({ ...form, body_type: e.target.value })}
                placeholder="e.g., Sedan"
              />
              <KGInput
                label="Color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="e.g., Silver"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="text-sm text-gray-600 block mb-2">Vehicle Photos</label>
              <div className="flex flex-wrap gap-3">
                {form.photos.map((photo, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-[#00C600]">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-[#00C600] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#00C600]/5">
                  {uploading ? (
                    <Loader2 className="animate-spin text-[#00C600]" size={24} />
                  ) : (
                    <>
                      <Upload size={24} className="text-[#00C600]" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <KGTextarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional notes about this vehicle"
            />

            <div className="flex gap-3 pt-4">
              <KGButton type="button" variant="outline" onClick={() => navigate(createPageUrl('ClientDashboard'))}>
                Cancel
              </KGButton>
              <KGButton type="submit" className="flex-1">
                Save Vehicle
              </KGButton>
            </div>
          </form>
      </KGCard>
    </div>
  );
}