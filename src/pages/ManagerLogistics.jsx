import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import KGButton from '@/components/ui/KGButton';
import KGBadge from '@/components/ui/KGBadge';
import KGInput, { KGSelect } from '@/components/ui/KGInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, Plus, ExternalLink, Package 
} from 'lucide-react';

export default function ManagerLogistics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [clients, setClients] = useState({});
  const [suppliers, setSuppliers] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const [newShipment, setNewShipment] = useState({
    po_id: '',
    type: 'inbound',
    tracking_number: '',
    carrier: 'FedEx',
    origin_address: '',
    destination_address: '',
    eta: ''
  });



  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      navigate(createPageUrl('ManagerLogin'));
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
    if (!profiles.length || profiles[0].role !== 'manager') {
      navigate(createPageUrl('ManagerLogin'));
      return;
    }
    setProfile(profiles[0]);

    const allShipments = await base44.entities.Shipment.list();
    // Sort by ETA first
    setShipments(allShipments.sort((a, b) => {
      if (!a.eta) return 1;
      if (!b.eta) return -1;
      return new Date(a.eta) - new Date(b.eta);
    }));

    const pos = await base44.entities.PurchaseOrder.list();
    setPurchaseOrders(pos);

    const orgs = await base44.entities.Organisation.list();
    const clientMap = {};
    const supplierMap = {};
    orgs.forEach(o => {
      if (o.org_type === 'client') clientMap[o.org_id] = o;
      if (o.org_type === 'supplier') supplierMap[o.org_id] = o;
    });
    setClients(clientMap);
    setSuppliers(supplierMap);

    setLoading(false);
  };



  const generateShipmentId = async () => {
    const num = shipments.length + 1;
    return `SHP-${String(num).padStart(3, '0')}`;
  };

  const createShipment = async () => {
    const shipmentId = await generateShipmentId();
    const po = purchaseOrders.find(p => p.po_id === newShipment.po_id);
    
    await base44.entities.Shipment.create({
      shipment_id: shipmentId,
      po_id: newShipment.po_id,
      type: newShipment.type,
      tracking_number: newShipment.tracking_number,
      carrier: newShipment.carrier,
      status: 'label_created',
      origin_address: newShipment.origin_address,
      destination_address: newShipment.destination_address,
      eta: newShipment.eta,
      client_visible: newShipment.type === 'outbound',
      org_id: newShipment.type === 'outbound' ? po?.client_org_id : null
    });

    // Update PO with tracking
    if (po) {
      if (newShipment.type === 'inbound') {
        await base44.entities.PurchaseOrder.update(po.id, { 
          tracking_number_inbound: newShipment.tracking_number 
        });
      } else {
        await base44.entities.PurchaseOrder.update(po.id, { 
          tracking_number_outbound: newShipment.tracking_number 
        });
      }
    }

    setShowAddModal(false);
    setNewShipment({
      po_id: '',
      type: 'inbound',
      tracking_number: '',
      carrier: 'FedEx',
      origin_address: '',
      destination_address: '',
      eta: ''
    });
    loadData();
  };

  const updateShipmentStatus = async (status) => {
    if (!selectedShipment) return;
    await base44.entities.Shipment.update(selectedShipment.id, { 
      status,
      delivered_date: status === 'delivered' ? new Date().toISOString().split('T')[0] : null
    });
    setSelectedShipment(null);
    loadData();
  };

  const inboundShipments = shipments.filter(s => s.type === 'inbound');
  const outboundShipments = shipments.filter(s => s.type === 'outbound');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Truck size={24} className="text-[#00C600]" />
              <h1 className="text-xl text-gray-800">Logistics</h1>
            </div>
            <KGButton onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Shipment
            </KGButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inbound - Supplier to KG */}
            <div>
              <h2 className="text-lg text-gray-700 mb-4 flex items-center gap-2">
                <Package size={18} />
                Inbound (Supplier → KG)
              </h2>
              <div className="space-y-3">
                {inboundShipments.length === 0 ? (
                  <KGCard className="text-center py-8 text-gray-500">
                    No inbound shipments
                  </KGCard>
                ) : (
                  inboundShipments.map((shipment) => (
                    <KGCard 
                      key={shipment.id}
                      onClick={() => setSelectedShipment(shipment)}
                      className="cursor-pointer hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#00C600] text-sm">{shipment.shipment_id}</span>
                            <KGBadge status={shipment.status} />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {shipment.carrier} • {shipment.tracking_number}
                          </p>
                          {shipment.po_id && (
                            <p className="text-xs text-gray-400">PO: {shipment.po_id}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {shipment.eta && (
                            <p className="text-sm">ETA: {new Date(shipment.eta).toLocaleDateString()}</p>
                          )}
                          <a
                            href={`https://www.fedex.com/fedextrack/?trknbr=${shipment.tracking_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#00C600] text-xs flex items-center gap-1 justify-end"
                          >
                            Track <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </KGCard>
                  ))
                )}
              </div>
            </div>

            {/* Outbound - KG to Client */}
            <div>
              <h2 className="text-lg text-gray-700 mb-4 flex items-center gap-2">
                <Truck size={18} />
                Outbound (KG → Client)
              </h2>
              <div className="space-y-3">
                {outboundShipments.length === 0 ? (
                  <KGCard className="text-center py-8 text-gray-500">
                    No outbound shipments
                  </KGCard>
                ) : (
                  outboundShipments.map((shipment) => (
                    <KGCard 
                      key={shipment.id}
                      onClick={() => setSelectedShipment(shipment)}
                      className="cursor-pointer hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#00C600] text-sm">{shipment.shipment_id}</span>
                            <KGBadge status={shipment.status} />
                            {shipment.client_visible && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Client Visible
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {shipment.carrier} • {shipment.tracking_number}
                          </p>
                          {shipment.org_id && (
                            <p className="text-xs text-gray-400">
                              To: {clients[shipment.org_id]?.name || shipment.org_id}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {shipment.eta && (
                            <p className="text-sm">ETA: {new Date(shipment.eta).toLocaleDateString()}</p>
                          )}
                          <a
                            href={`https://www.fedex.com/fedextrack/?trknbr=${shipment.tracking_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#00C600] text-xs flex items-center gap-1 justify-end"
                          >
                            Track <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </KGCard>
                  ))
                )}
              </div>
            </div>
          </div>


      {/* Add Shipment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <KGSelect
              label="Purchase Order"
              value={newShipment.po_id}
              onChange={(e) => setNewShipment({ ...newShipment, po_id: e.target.value })}
              options={purchaseOrders.map(po => ({ value: po.po_id, label: po.po_id }))}
              placeholder="Select PO..."
            />

            <KGSelect
              label="Shipment Type"
              value={newShipment.type}
              onChange={(e) => setNewShipment({ ...newShipment, type: e.target.value })}
              options={[
                { value: 'inbound', label: 'Inbound (Supplier → KG)' },
                { value: 'outbound', label: 'Outbound (KG → Client)' }
              ]}
            />

            <KGInput
              label="Tracking Number"
              value={newShipment.tracking_number}
              onChange={(e) => setNewShipment({ ...newShipment, tracking_number: e.target.value })}
              placeholder="FedEx tracking number"
            />

            <KGInput
              label="Carrier"
              value={newShipment.carrier}
              onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
              placeholder="FedEx"
            />

            <KGInput
              label="Origin Address"
              value={newShipment.origin_address}
              onChange={(e) => setNewShipment({ ...newShipment, origin_address: e.target.value })}
              placeholder="Pickup address"
            />

            <KGInput
              label="Destination Address"
              value={newShipment.destination_address}
              onChange={(e) => setNewShipment({ ...newShipment, destination_address: e.target.value })}
              placeholder="Delivery address"
            />

            <KGInput
              label="ETA"
              type="date"
              value={newShipment.eta}
              onChange={(e) => setNewShipment({ ...newShipment, eta: e.target.value })}
            />

            <div className="flex gap-3">
              <KGButton variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </KGButton>
              <KGButton onClick={createShipment} className="flex-1">
                Create Shipment
              </KGButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shipment Detail Modal */}
      <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shipment {selectedShipment?.shipment_id}</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="capitalize">{selectedShipment.type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Carrier:</span>
                  <p>{selectedShipment.carrier}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tracking:</span>
                  <p>{selectedShipment.tracking_number}</p>
                </div>
                <div>
                  <span className="text-gray-500">ETA:</span>
                  <p>{selectedShipment.eta ? new Date(selectedShipment.eta).toLocaleDateString() : '-'}</p>
                </div>
              </div>

              {selectedShipment.origin_address && (
                <div>
                  <span className="text-sm text-gray-500">From:</span>
                  <p className="text-sm">{selectedShipment.origin_address}</p>
                </div>
              )}

              {selectedShipment.destination_address && (
                <div>
                  <span className="text-sm text-gray-500">To:</span>
                  <p className="text-sm">{selectedShipment.destination_address}</p>
                </div>
              )}

              <KGSelect
                label="Update Status"
                value={selectedShipment.status}
                onChange={(e) => updateShipmentStatus(e.target.value)}
                options={[
                  { value: 'label_created', label: 'Label Created' },
                  { value: 'picked_up', label: 'Picked Up' },
                  { value: 'in_transit', label: 'In Transit' },
                  { value: 'out_for_delivery', label: 'Out for Delivery' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'delayed', label: 'Delayed' }
                ]}
              />

              <a
                href={`https://www.fedex.com/fedextrack/?trknbr=${selectedShipment.tracking_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[#00C600] hover:underline"
              >
                Track on FedEx <ExternalLink size={14} />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}