import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import TableExport from '../components/TableExport';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, TruckIcon, Car, Users, Building2, Phone, Mail, Calendar, Edit, Plus } from 'lucide-react';

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    vin: '',
    fuel: '',
    engine_size: '',
    engine_power: '',
    engine_code: '',
    transmission: '',
    gears: ''
  });
  const [newPurchase, setNewPurchase] = useState({
    po_id: '',
    supplier_org_id: '',
    order_date: '',
    eta: '',
    status: 'ordered'
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const profileData = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    
    if (!profileData) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }

    setProfile(profileData);

    const orgData = (await base44.entities.Organisation.filter({ org_id: profileData.org_id }))[0];
    setOrg(orgData);

    const vehiclesData = await base44.entities.Vehicle.filter({ org_id: profileData.org_id });
    setVehicles(vehiclesData);

    const purchasesData = await base44.entities.PurchaseOrder.filter({ client_org_id: profileData.org_id });
    setPurchases(purchasesData);

    setLoading(false);
  };

  const decodeVIN = async () => {
    if (newVehicle.vin.length < 17) {
      toast.error('VIN must be 17 characters');
      return;
    }

    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${newVehicle.vin}?format=json`);
      const data = await response.json();
      
      if (data.Results && data.Results.length > 0) {
        const result = data.Results;
        const make = result.find(r => r.Variable === 'Make')?.Value || '';
        const model = result.find(r => r.Variable === 'Model')?.Value || '';
        const year = result.find(r => r.Variable === 'Model Year')?.Value || '';
        
        setNewVehicle({ ...newVehicle, brand: make, model, year });
        toast.success('VIN decoded');
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
        org_id: profile.org_id,
        vin: newVehicle.vin || '',
        make: newVehicle.brand || '',
        model: newVehicle.model || '',
        year: newVehicle.year ? parseInt(newVehicle.year) : null,
        trim: '',
        engine: newVehicle.engine_code || '',
        transmission: newVehicle.transmission || '',
        color: '',
        notes: ''
      });
      toast.success('Vehicle added');
      setShowAddVehicleModal(false);
      setNewVehicle({
        brand: '',
        model: '',
        year: '',
        vin: '',
        fuel: '',
        engine_size: '',
        engine_power: '',
        engine_code: '',
        transmission: '',
        gears: ''
      });
      loadData();
    } catch (err) {
      toast.error('Error adding vehicle');
    }
  };

  const savePurchase = async () => {
    try {
      const poId = `PO-${Date.now()}`;
      await base44.entities.PurchaseOrder.create({
        po_id: newPurchase.po_id || poId,
        supplier_org_id: newPurchase.supplier_org_id || '',
        client_org_id: profile.org_id,
        order_date: newPurchase.order_date,
        eta: newPurchase.eta,
        status: newPurchase.status,
        items: [],
        total_cost: 0
      });
      toast.success('Purchase added');
      setShowAddPurchaseModal(false);
      setNewPurchase({
        po_id: '',
        supplier_org_id: '',
        order_date: '',
        eta: '',
        status: 'ordered'
      });
      loadData();
    } catch (err) {
      toast.error('Error adding purchase');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const menuCards = [
    { icon: FileText, name: 'Quotes', desc: 'Review quote requests', page: 'ClientQuotes' },
    { icon: TruckIcon, name: 'Shipments', desc: 'Track deliveries', page: 'ClientShipments' },
    { icon: Car, name: 'Vehicles', desc: 'Manage fleet details', page: 'ClientVehicleAdd' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="text-2xl mb-1 text-[#00c600]">DASHBOARD</div>
        <div className="text-sm opacity-70">Welcome back, {org?.contact_name}</div>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#00c600] relative">
              <button 
                onClick={() => navigate(createPageUrl(`ClientOrganisationDetail?org_id=${org?.id}`))}
                className="absolute top-4 right-4 p-2 hover:bg-[#00c600] hover:bg-opacity-20 rounded transition-all"
              >
                <Edit size={16} color="#00c600" />
              </button>

        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} color="#00c600" />
          <div className="text-xs opacity-70">COMPANY PROFILE</div>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded flex items-center justify-center border border-[#00c600]">
              <Building2 size={32} color="#00c600" />
            </div>
            <div>
              <div className="text-xl mb-1">{org?.name}</div>
              <div className="text-sm opacity-70">{org?.org_id}</div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 ml-8">
            <div className="flex items-center gap-2">
              <Phone size={14} color="#00c600" />
              <div className="text-sm">{org?.contact_phone || '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} color="#00c600" />
              <div className="text-sm">Member since {org?.created_date?.split('T')[0] || 'Jan 2026'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} color="#00c600" />
              <div className="text-sm">{org?.contact_email}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#00c600]">
        <div className="border-t border-[#00c600] pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>Your Vehicles</div>
              <button 
                onClick={() => setShowAddVehicleModal(true)}
                className="bg-[#00c600] text-black px-3 py-1 rounded text-sm hover:opacity-80"
              >
                + Add Vehicle
              </button>
            </div>
            <table>
            <thead>
              <tr>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>VIN</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} onClick={() => navigate(createPageUrl(`ClientVehicleDetail?id=${v.id}`))}>
                  <td>{v.make}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td>{v.vin}</td>
                  <td>{v.vehicle_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#00c600] pt-4">
          <div className="flex justify-between items-center mb-2">
            <div>What You Bought</div>
            <button 
              onClick={() => setShowAddPurchaseModal(true)}
              className="bg-[#00c600] text-black px-3 py-1 rounded text-sm hover:opacity-80"
            >
              + Add Purchase
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>PO ID</th>
                <th>Items</th>
                <th>Status</th>
                <th>Tracking</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td>{p.order_date}</td>
                  <td>{p.po_id}</td>
                  <td>{p.items?.length || 0}</td>
                  <td>{p.status}</td>
                  <td>{p.tracking_number_outbound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Dialog open={showAddVehicleModal} onOpenChange={setShowAddVehicleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Brand"
              value={newVehicle.brand}
              onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="text" 
              placeholder="Model"
              value={newVehicle.model}
              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="number" 
              placeholder="Year"
              value={newVehicle.year}
              onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="VIN"
                value={newVehicle.vin}
                onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                className="flex-1 p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
              />
              <button 
                onClick={decodeVIN}
                className="bg-[#00c600] text-black px-3 py-2 rounded text-sm hover:opacity-80 whitespace-nowrap"
              >
                DECODE
              </button>
            </div>
            <select 
              value={newVehicle.fuel}
              onChange={(e) => setNewVehicle({ ...newVehicle, fuel: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            >
              <option value="">Select Fuel</option>
              <option value="diesel">Diesel</option>
              <option value="petrol">Petrol</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input 
              type="text" 
              placeholder="Engine Code"
              value={newVehicle.engine_code}
              onChange={(e) => setNewVehicle({ ...newVehicle, engine_code: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <select 
              value={newVehicle.transmission}
              onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            >
              <option value="">Select Transmission</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddVehicleModal(false)}
                className="flex-1 p-2 border border-[#00c600] text-[#00c600] rounded text-sm hover:opacity-80"
              >
                Cancel
              </button>
              <button 
                onClick={saveVehicle}
                className="flex-1 bg-[#00c600] text-black p-2 rounded text-sm hover:opacity-80"
              >
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Purchase Modal */}
      <Dialog open={showAddPurchaseModal} onOpenChange={setShowAddPurchaseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="PO ID"
              value={newPurchase.po_id}
              onChange={(e) => setNewPurchase({ ...newPurchase, po_id: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="date" 
              placeholder="Order Date"
              value={newPurchase.order_date}
              onChange={(e) => setNewPurchase({ ...newPurchase, order_date: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="date" 
              placeholder="ETA"
              value={newPurchase.eta}
              onChange={(e) => setNewPurchase({ ...newPurchase, eta: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddPurchaseModal(false)}
                className="flex-1 p-2 border border-[#00c600] text-[#00c600] rounded text-sm hover:opacity-80"
              >
                Cancel
              </button>
              <button 
                onClick={savePurchase}
                className="flex-1 bg-[#00c600] text-black p-2 rounded text-sm hover:opacity-80"
              >
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}