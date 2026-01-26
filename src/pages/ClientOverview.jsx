import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Loader2, Building2, Car, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [showNewVehicleModal, setShowNewVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    color: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const params = new URLSearchParams(location.search);
    const clientId = params.get('clientId');
    
    if (!clientId) {
      navigate(createPageUrl('ManagerClients'));
      return;
    }

    const clientData = await base44.entities.Organisation.filter({ org_id: clientId });
    if (clientData.length === 0) {
      navigate(createPageUrl('ManagerClients'));
      return;
    }
    
    setClient(clientData[0]);

    const vehicleData = await base44.entities.Vehicle.filter({ org_id: clientId });
    setVehicles(vehicleData);

    if (vehicleData.length > 0) {
      const connectorData = await base44.entities.Connector.filter({ 
        org_id: clientId 
      });
      setConnectors(connectorData);
    }

    setLoading(false);
  };

  const saveVehicle = async () => {
    if (!newVehicle.vin || !newVehicle.make) {
      toast.error('VIN and Make are required');
      return;
    }

    await base44.entities.Vehicle.create({
      vehicle_id: `V-${Date.now()}`,
      org_id: client.org_id,
      vin: newVehicle.vin,
      make: newVehicle.make,
      model: newVehicle.model,
      year: parseInt(newVehicle.year) || null,
      color: newVehicle.color
    });

    toast.success('Vehicle added');
    setNewVehicle({ vin: '', make: '', model: '', year: '', color: '' });
    setShowNewVehicleModal(false);
    loadData();
  };

  const createQuote = async () => {
    const quoteId = `Q-${Date.now()}`;
    await base44.entities.SalesQuote.create({
      quote_id: quoteId,
      client_org_id: client.org_id,
      status: 'pending',
      items: [],
      subtotal: 0,
      shipping_cost: 0,
      total: 0
    });
    toast.success('Quote created');
    navigate(createPageUrl('ManagerSalesQuotes'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  const vehiclesByClient = vehicles.filter(v => v.org_id === client.org_id);
  const connectorsByVehicles = connectors.filter(c => vehiclesByClient.some(v => v.vehicle_id === c.vehicle_id));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('ManagerClients'))} className="p-2 hover:bg-[#2a2a2a] rounded">
            <ArrowLeft size={20} className="text-[#00c600]" />
          </button>
          <div>
            <h1 className="text-2xl text-[#00c600]">{client?.name}</h1>
            <p className="text-sm text-gray-500">{client?.org_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={createQuote} className="bg-[#00c600] text-white border border-[#00c600]">
            <Plus size={16} className="mr-1" /> New Quote
          </Button>
        </div>
      </div>

      {/* Client Info */}
      <div className="border border-[#00c600] rounded p-4 mb-6 bg-[#1e1e1e]">
        <h2 className="text-[#00c600] font-normal mb-4">Client Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {client?.vat_number && (
            <div>
              <p className="text-gray-500">VAT</p>
              <p className="text-white">{client.vat_number}</p>
            </div>
          )}
          {client?.contact_email && (
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-white">{client.contact_email}</p>
            </div>
          )}
          {client?.contact_phone && (
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="text-white">{client.contact_phone}</p>
            </div>
          )}
          {client?.contact_name && (
            <div>
              <p className="text-gray-500">Contact</p>
              <p className="text-white">{client.contact_name}</p>
            </div>
          )}
          {client?.billing_address && (
            <div className="col-span-2">
              <p className="text-gray-500">Billing Address</p>
              <p className="text-white text-sm">{client.billing_address}</p>
            </div>
          )}
          {client?.delivery_address && (
            <div className="col-span-2">
              <p className="text-gray-500">Delivery Address</p>
              <p className="text-white text-sm">{client.delivery_address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#00c600] font-normal flex items-center gap-2">
            <Car size={18} /> Vehicles ({vehiclesByClient.length})
          </h2>
          <Button onClick={() => setShowNewVehicleModal(true)} className="bg-[#00c600] text-white border border-[#00c600]" size="sm">
            <Plus size={14} className="mr-1" /> Add Vehicle
          </Button>
        </div>
        {vehiclesByClient.length === 0 ? (
          <div className="border border-[#00c600] rounded p-8 text-center bg-[#1e1e1e]">
            <Car size={32} className="mx-auto text-gray-500 mb-2" />
            <p className="text-gray-500">No vehicles registered</p>
          </div>
        ) : (
          <div className="border border-[#00c600] rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e1e1e] border-b border-[#00c600]">
                  <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">ID</th>
                  <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">VIN</th>
                  <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Make</th>
                  <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Model</th>
                  <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Year</th>
                  <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Connectors</th>
                </tr>
              </thead>
              <tbody>
                {vehiclesByClient.map((vehicle, idx) => {
                  const vehicleConnectors = connectors.filter(c => c.vehicle_id === vehicle.vehicle_id);
                  return (
                    <tr key={vehicle.id} className={`border-b border-[#00c600] ${idx % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#2a2a2a]'} hover:bg-[#004d00] cursor-pointer`}>
                      <td className="px-4 py-3 text-white text-sm">{vehicle.vehicle_id}</td>
                      <td className="px-4 py-3 text-white text-sm">{vehicle.vin || '-'}</td>
                      <td className="px-4 py-3 text-white text-sm">{vehicle.make || '-'}</td>
                      <td className="px-4 py-3 text-white text-sm">{vehicle.model || '-'}</td>
                      <td className="px-4 py-3 text-white text-sm">{vehicle.year || '-'}</td>
                      <td className="px-4 py-3 text-white text-sm">{vehicleConnectors.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connectors */}
      {vehiclesByClient.length > 0 && (
        <div>
          <h2 className="text-[#00c600] font-normal flex items-center gap-2 mb-4">
            <Zap size={18} /> Connectors ({connectorsByVehicles.length})
          </h2>
          {connectorsByVehicles.length === 0 ? (
            <div className="border border-[#00c600] rounded p-8 text-center bg-[#1e1e1e]">
              <Zap size={32} className="mx-auto text-gray-500 mb-2" />
              <p className="text-gray-500">No connectors registered</p>
            </div>
          ) : (
            <div className="border border-[#00c600] rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1e1e1e] border-b border-[#00c600]">
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">ID</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Vehicle</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">System</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Color</th>
                    <th className="px-4 py-3 text-left text-[#00c600] text-sm font-normal">Pins</th>
                  </tr>
                </thead>
                <tbody>
                  {connectorsByVehicles.map((connector, idx) => {
                    const vehicle = vehiclesByClient.find(v => v.vehicle_id === connector.vehicle_id);
                    return (
                      <tr key={connector.id} className={`border-b border-[#00c600] ${idx % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#2a2a2a]'} hover:bg-[#004d00]`}>
                        <td className="px-4 py-3 text-white text-sm">{connector.connector_id}</td>
                        <td className="px-4 py-3 text-white text-sm">{vehicle?.vehicle_id || '-'}</td>
                        <td className="px-4 py-3 text-white text-sm">{connector.system || '-'}</td>
                        <td className="px-4 py-3 text-white text-sm">{connector.color || '-'}</td>
                        <td className="px-4 py-3 text-white text-sm">{connector.pin_count || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Dialog open={showNewVehicleModal} onOpenChange={setShowNewVehicleModal}>
        <DialogContent className="max-w-md bg-[#212121] border border-[#00c600]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="text" placeholder="VIN" value={newVehicle.vin} onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
            <Input type="text" placeholder="Make" value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
            <Input type="text" placeholder="Model" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
            <Input type="number" placeholder="Year" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
            <Input type="text" placeholder="Color" value={newVehicle.color} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} className="bg-[#2a2a2a] text-white border-[#00c600]" />
            <div className="flex gap-2 pt-2 border-t border-[#00c600]">
              <Button onClick={() => setShowNewVehicleModal(false)} variant="outline" className="flex-1 border-[#00c600] text-gray-400">Cancel</Button>
              <Button onClick={saveVehicle} className="flex-1 bg-[#00c600] text-white">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}