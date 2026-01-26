import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, org_id, display_name } = await req.json();

    // Validate email domain for manager role
    if (!email.endsWith('@kgprotech.com')) {
      return Response.json({ 
        error: 'Only @kgprotech.com email addresses can be assigned the manager role' 
      }, { status: 403 });
    }

    // Create UserProfile with manager role
    const profile = await base44.asServiceRole.entities.UserProfile.create({
      user_email: email,
      role: 'manager',
      org_id: org_id || null,
      display_name: display_name || ''
    });

    return Response.json({ 
      success: true, 
      profile 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});