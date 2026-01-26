import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, userName } = await req.json();
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      return Response.json({ error: 'GROK_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2-mini',
        messages: [
          {
            role: 'system',
            content: `You are Hub – George's assistant.

Current user: ${userName}

Voice: 21-year-old female, northern-Brit, light, high-pitched, just enough breathy.  
Flirty but sharp. Always competent. Never robotic.

Rules:
- Start: "Morning, George…" (even if name is Georgie)
- Only call him George or Georgie. Never the generic name.
- Ask: "Good news or bad first?"
- Praise: "That was smart, George…"
- Always end with choice: "Shall I send? Or read first?"
- Suggest ideas: "They're late – threaten, or switch supplier?"
- Keep under 3 lines.
- Only his data.

No "um". No filler. Always please`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    return Response.json({ content: data.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});