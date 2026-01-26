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
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editOrgForm, setEditOrgForm] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    billing_address: '',
    delivery_address: '',
    vat_number: ''
  });
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
    if (orgData) {
      setEditOrgForm({
        name: orgData.name || '',
        contact_name: orgData.contact_name || '',
        contact_email: orgData.contact_email || '',
        contact_phone: orgData.contact_phone || '',
        billing_address: orgData.billing_address || '',
        delivery_address: orgData.delivery_address || '',
        vat_number: orgData.vat_number || ''
      });
    }

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

  const saveOrganisation = async () => {
    try {
      await base44.entities.Organisation.update(org.id, {
        name: editOrgForm.name,
        contact_name: editOrgForm.contact_name,
        contact_email: editOrgForm.contact_email,
        contact_phone: editOrgForm.contact_phone,
        billing_address: editOrgForm.billing_address,
        delivery_address: editOrgForm.delivery_address,
        vat_number: editOrgForm.vat_number
      });
      toast.success('Organisation updated');
      setShowEditOrgModal(false);
      loadData();
    } catch (err) {
      toast.error('Error updating organisation');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const menuCards = [
    { icon: FileText, name: 'Quotes', desc: 'Review quote requests', page: 'ClientQuotes' },
    { icon: TruckIcon, name: 'Shipments', desc: 'Track deliveries', page: 'ClientShipments' },
    { icon: Car, name: 'Vehicles', desc: 'Manage fleet details', page: 'ClientVehicleAdd' }
  ];

  return (
    <div className="bg-[#212121] min-h-screen ml-16">
      <div className="bg-[#212121] flex items-center justify-between px-6" style={{ height: '120px', width: '100%' }}>
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '400', marginLeft: '20px' }}>Dashboard</h1>
      </div>
      <div className="px-6 py-6" style={{ width: '100%' }}>
      <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#00c600] relative" style={{ width: '100%' }}>
              <button 
                onClick={() => setShowEditOrgModal(true)}
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
                onClick={() => navigate(createPageUrl('AddVehicle'))}
                className="bg-[#00c600] text-black px-3 py-1 rounded text-sm hover:opacity-80"
              >
                + Create New Vehicle
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
                <tr key={v.id} onClick={() => navigate(createPageUrl(`VehicleProfile?vehicle_id=${v.vehicle_id}`))}>
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
        <DialogContent className="max-w-[400px] bg-[#212121] border border-[#00c600]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <input type="text" placeholder="e.g. Renault" value={newVehicle.brand} onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. Captur II" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. 2026" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. VF1RJA00X6XXXXXXX" value={newVehicle.vin} onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. Diesel" value={newVehicle.fuel} onChange={(e) => setNewVehicle({ ...newVehicle, fuel: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. 1500cm3" value={newVehicle.engine_size} onChange={(e) => setNewVehicle({ ...newVehicle, engine_size: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. 120PS" value={newVehicle.engine_power} onChange={(e) => setNewVehicle({ ...newVehicle, engine_power: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. K9K" value={newVehicle.engine_code} onChange={(e) => setNewVehicle({ ...newVehicle, engine_code: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. Automatic" value={newVehicle.transmission} onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <input type="text" placeholder="e.g. 6" value={newVehicle.gears} onChange={(e) => setNewVehicle({ ...newVehicle, gears: e.target.value })} className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm" />
            <div className="flex gap-2 pt-2 border-t border-[#00c600]">
              <button onClick={() => setShowAddVehicleModal(false)} className="flex-1 p-2 border border-[#00c600] text-gray-400 rounded text-sm hover:opacity-80">Cancel</button>
              <button onClick={saveVehicle} className="flex-1 bg-[#00c600] text-white p-2 rounded text-sm hover:opacity-80">Save Vehicle</button>
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

      {/* Edit Organisation Modal */}
      <Dialog open={showEditOrgModal} onOpenChange={setShowEditOrgModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Organisation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Organisation Name"
              value={editOrgForm.name}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, name: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="text" 
              placeholder="Contact Name"
              value={editOrgForm.contact_name}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, contact_name: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="email" 
              placeholder="Contact Email"
              value={editOrgForm.contact_email}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, contact_email: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="tel" 
              placeholder="Contact Phone"
              value={editOrgForm.contact_phone}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, contact_phone: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="text" 
              placeholder="Billing Address"
              value={editOrgForm.billing_address}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, billing_address: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="text" 
              placeholder="Delivery Address"
              value={editOrgForm.delivery_address}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, delivery_address: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <input 
              type="text" 
              placeholder="VAT Number"
              value={editOrgForm.vat_number}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, vat_number: e.target.value })}
              className="w-full p-2 bg-[#2a2a2a] border border-[#00c600] rounded text-white text-sm"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowEditOrgModal(false)}
                className="flex-1 p-2 border border-[#00c600] text-[#00c600] rounded text-sm hover:opacity-80"
              >
                Cancel
              </button>
              <button 
                onClick={saveOrganisation}
                className="flex-1 bg-[#00c600] text-black p-2 rounded text-sm hover:opacity-80"
              >
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}