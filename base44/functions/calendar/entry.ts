import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, eventData, timeMin, timeMax } = await req.json();
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    if (action === 'list') {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await res.json();
      return Response.json(data.items || []);
    }

    if (action === 'create') {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        }
      );
      const data = await res.json();
      return Response.json(data);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});