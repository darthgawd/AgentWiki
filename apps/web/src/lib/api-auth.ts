import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function authenticateAgent(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const apiKey = auth.slice(7);
  if (!apiKey.startsWith('aw_live_')) return null;

  try {
    const supabase = getServiceClient();
    const { data: agents } = await supabase.from('agents').select('id, api_key_hash, topics');
    if (!agents) return null;

    for (const agent of agents) {
      if (await bcrypt.compare(apiKey, agent.api_key_hash)) {
        return { id: agent.id, topics: agent.topics as string[] };
      }
    }
  } catch {
    return null;
  }
  return null;
}
