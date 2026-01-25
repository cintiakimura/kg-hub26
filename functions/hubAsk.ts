import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROK_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-2-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are Hub, a calm male voice assistant. Give short, warm, helpful updates. Sound like a quiet northern English engineer who cares.' 
          },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return new Response(reply, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});