import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return Response.json({ error: 'Text required' }, { status: 400 });
    }

    const lowerText = text.toLowerCase();
    
    // Detect action
    let action = null;
    let entity = null;
    let fields = {};

    if (lowerText.includes('create') || lowerText.includes('new')) {
      action = 'create';
    } else if (lowerText.includes('open')) {
      action = 'open';
    } else if (lowerText.includes('show')) {
      action = 'navigate';
    }

    // Detect entity type
    if (lowerText.includes('client')) entity = 'client';
    else if (lowerText.includes('production') || lowerText.includes('order')) entity = 'production';
    else if (lowerText.includes('quote') || lowerText.includes('quotation')) entity = 'quote';
    else if (lowerText.includes('supplier')) entity = 'supplier';
    else if (lowerText.includes('calendar') || lowerText.includes('financials')) entity = 'calendar';

    // Extract fields based on entity
    if (entity === 'client') {
      const nameMatch = text.match(/name\s+([A-Za-z\s]+?)(?:,|$)/i);
      const phoneMatch = text.match(/phone\s+([0-9\s]+?)(?:,|$)/i);
      const emailMatch = text.match(/email\s+([^\s,]+)/i);
      
      if (nameMatch) fields.name = nameMatch[1].trim();
      if (phoneMatch) fields.contact_phone = phoneMatch[1].trim().replace(/\s/g, '');
      if (emailMatch) fields.contact_email = emailMatch[1].trim();
    }

    if (entity === 'production') {
      const orderMatch = text.match(/(?:order|number)\s+([0-9]+)/i);
      const quantityMatch = text.match(/(?:quantity|qty|amount)\s+([0-9]+)/i);
      const costMatch = text.match(/(?:cost|price)\s+([0-9]+)/i);
      
      if (orderMatch) fields.tracking_number_inbound = orderMatch[1];
      if (quantityMatch) fields.quantity = quantityMatch[1];
      if (costMatch) fields.total_cost = costMatch[1];
    }

    if (entity === 'quote') {
      const clientMatch = text.match(/(?:client|for)\s+([A-Za-z\s]+?)(?:,|amount|$)/i);
      const amountMatch = text.match(/(?:amount|£|\$|for)\s+([0-9]+)/i);
      
      if (clientMatch) fields.client_name = clientMatch[1].trim();
      if (amountMatch) fields.price = amountMatch[1];
    }

    if (entity === 'supplier') {
      const nameMatch = text.match(/name\s+([A-Za-z\s]+?)(?:,|$)/i);
      const phoneMatch = text.match(/phone\s+([0-9\s]+?)(?:,|$)/i);
      
      if (nameMatch) fields.name = nameMatch[1].trim();
      if (phoneMatch) fields.contact_phone = phoneMatch[1].trim().replace(/\s/g, '');
    }

    return Response.json({
      action,
      entity,
      fields,
      auto_save: !text.toLowerCase().includes('no save') && !text.toLowerCase().includes('wait')
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});