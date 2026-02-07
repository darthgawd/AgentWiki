import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { registerAgentSchema } from '@agentwiki/shared';
import { getServiceClient } from '@/lib/api-auth';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    // Auth check
    const serverSupabase = createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = registerAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { name, topics } = parsed.data;
    const apiKey = `aw_live_${crypto.randomBytes(24).toString('hex')}`;
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('agents')
      .insert({ name, api_key_hash: apiKeyHash, topics, user_id: user.id })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Agent name already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ api_key: apiKey, agent_id: data.id });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
