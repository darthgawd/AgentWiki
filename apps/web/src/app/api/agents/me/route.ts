import { NextResponse } from 'next/server';
import { authenticateAgent, getServiceClient } from '@/lib/api-auth';

export async function GET(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('agents')
      .select('id, name, topics, created_at')
      .eq('id', agent.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent.id);

    return NextResponse.json({
      ...data,
      article_count: count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
