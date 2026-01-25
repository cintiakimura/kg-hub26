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

    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel - warm British female

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.8,
          similarity_boost: 0.85
        }
      })
    });

    if (!response.ok) {
      throw new Error('ElevenLabs API error');
    }

    const audioBlob = await response.blob();
    
    return new Response(audioBlob, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});