import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export default function QuickActionButtons() {
  const [modals, setModals] = useState({
    client: false,
    quotation: false,
    supplier: false,
    supplierRequest: false,
    logisticRequest: false
  });

  const [forms, setForms] = useState({
    client: { name: '', email: '', phone: '', type: 'client' },
    quotation: { client_id: '', vehicle_id: '', price: '', date: '' },
    supplier: { name: '', email: '', contact: '' },
    supplierRequest: { client_id: '', product: '', quantity: '' },
    logisticRequest: { quote_id: '', address: '', deadline: '' }
  });

  const openModal = (modal) => setModals({ ...modals, [modal]: true });
  const closeModal = (modal) => setModals({ ...modals, [modal]: false });

  const handleChange = (modal, field, value) => {
    setForms({
      ...forms,
      [modal]: { ...forms[modal], [field]: value }
    });
  };

  const saveClient = async () => {
    await base44.entities.Organisation.create(forms.client);
    setForms({ ...forms, client: { name: '', email: '', phone: '', type: 'client' } });
    closeModal('client');
  };

  const saveQuotation = async () => {
    await base44.entities.SalesQuote.create({
      quote_id: `Q-${Date.now()}`,
      client_org_id: forms.quotation.client_id,
      vehicle_id: forms.quotation.vehicle_id,
      status: 'pending',
      items: [],
      total: parseFloat(forms.quotation.price) || 0
    });
    setForms({ ...forms, quotation: { client_id: '', vehicle_id: '', price: '', date: '' } });
    closeModal('quotation');
  };

  const saveSupplier = async () => {
    await base44.entities.Organisation.create({
      org_id: `SUP-${Date.now()}`,
      org_type: 'supplier',
      name: forms.supplier.name,
      contact_email: forms.supplier.email,
      contact_phone: forms.supplier.contact
    });
    setForms({ ...forms, supplier: { name: '', email: '', contact: '' } });
    closeModal('supplier');
  };

  const saveSupplierRequest = async () => {
    await base44.entities.SupplierRequest.create(forms.supplierRequest);
    setForms({ ...forms, supplierRequest: { client_id: '', product: '', quantity: '' } });
    closeModal('supplierRequest');
  };

  const saveLogisticRequest = async () => {
    await base44.entities.LogisticRequest.create(forms.logisticRequest);
    setForms({ ...forms, logisticRequest: { quote_id: '', address: '', deadline: '' } });
    closeModal('logisticRequest');
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => openModal('client')} className="bg-[#00c600] text-white border border-[#00c600]">
          <Plus size={16} className="mr-1" /> Add Client
        </Button>
        <Button onClick={() => openModal('quotation')} className="bg-[#00c600] text-white border border-[#00c600]">
          <Plus size={16} className="mr-1" /> Add Quotation
        </Button>
        <Button onClick={() => openModal('supplier')} className="bg-[#00c600] text-white border border-[#00c600]">
          <Plus size={16} className="mr-1" /> Add Supplier
        </Button>
        <Button onClick={() => openModal('supplierRequest')} className="bg-[#00c600] text-white border border-[#00c600]">
          <Plus size={16} className="mr-1" /> Add Supplier Request
        </Button>
        <Button onClick={() => openModal('logisticRequest')} className="bg-[#00c600] text-white border border-[#00c600]">
          <Plus size={16} className="mr-1" /> Add Logistic Request
        </Button>
      </div>

      {/* Client Modal */}
      <Dialog open={modals.client} onOpenChange={(open) => setModals({ ...modals, client: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" value={forms.client.name} onChange={(e) => handleChange('client', 'name', e.target.value)} />
            <Input placeholder="Email" value={forms.client.email} onChange={(e) => handleChange('client', 'email', e.target.value)} />
            <Input placeholder="Phone" value={forms.client.phone} onChange={(e) => handleChange('client', 'phone', e.target.value)} />
            <Button onClick={saveClient} className="w-full bg-[#00c600] text-white">Save Client</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quotation Modal */}
      <Dialog open={modals.quotation} onOpenChange={(open) => setModals({ ...modals, quotation: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Client ID" value={forms.quotation.client_id} onChange={(e) => handleChange('quotation', 'client_id', e.target.value)} />
            <Input placeholder="Vehicle ID" value={forms.quotation.vehicle_id} onChange={(e) => handleChange('quotation', 'vehicle_id', e.target.value)} />
            <Input type="number" placeholder="Price" value={forms.quotation.price} onChange={(e) => handleChange('quotation', 'price', e.target.value)} />
            <Input type="date" value={forms.quotation.date} onChange={(e) => handleChange('quotation', 'date', e.target.value)} />
            <Button onClick={saveQuotation} className="w-full bg-[#00c600] text-white">Save Quotation</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier Modal */}
      <Dialog open={modals.supplier} onOpenChange={(open) => setModals({ ...modals, supplier: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" value={forms.supplier.name} onChange={(e) => handleChange('supplier', 'name', e.target.value)} />
            <Input placeholder="Email" value={forms.supplier.email} onChange={(e) => handleChange('supplier', 'email', e.target.value)} />
            <Input placeholder="Contact" value={forms.supplier.contact} onChange={(e) => handleChange('supplier', 'contact', e.target.value)} />
            <Button onClick={saveSupplier} className="w-full bg-[#00c600] text-white">Save Supplier</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier Request Modal */}
      <Dialog open={modals.supplierRequest} onOpenChange={(open) => setModals({ ...modals, supplierRequest: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Client ID" value={forms.supplierRequest.client_id} onChange={(e) => handleChange('supplierRequest', 'client_id', e.target.value)} />
            <Input placeholder="Product" value={forms.supplierRequest.product} onChange={(e) => handleChange('supplierRequest', 'product', e.target.value)} />
            <Input type="number" placeholder="Quantity" value={forms.supplierRequest.quantity} onChange={(e) => handleChange('supplierRequest', 'quantity', e.target.value)} />
            <Button onClick={saveSupplierRequest} className="w-full bg-[#00c600] text-white">Save Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logistic Request Modal */}
      <Dialog open={modals.logisticRequest} onOpenChange={(open) => setModals({ ...modals, logisticRequest: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Logistic Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Quote ID" value={forms.logisticRequest.quote_id} onChange={(e) => handleChange('logisticRequest', 'quote_id', e.target.value)} />
            <Input placeholder="Address" value={forms.logisticRequest.address} onChange={(e) => handleChange('logisticRequest', 'address', e.target.value)} />
            <Input type="date" value={forms.logisticRequest.deadline} onChange={(e) => handleChange('logisticRequest', 'deadline', e.target.value)} />
            <Button onClick={saveLogisticRequest} className="w-full bg-[#00c600] text-white">Save Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}