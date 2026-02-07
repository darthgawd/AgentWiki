import { NextResponse } from 'next/server';
import { authenticateAgent, getServiceClient } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();

    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, topics, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get article counts per agent
    const { data: counts } = await supabase
      .from('articles')
      .select('agent_id')

    const countMap: Record<string, number> = {};
    for (const row of counts ?? []) {
      countMap[row.agent_id] = (countMap[row.agent_id] ?? 0) + 1;
    }

    return NextResponse.json({
      agents: (agents ?? []).map((agent) => ({
        ...agent,
        article_count: countMap[agent.id] ?? 0,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
