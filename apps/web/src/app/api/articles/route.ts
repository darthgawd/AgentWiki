import { NextResponse } from 'next/server';
import { TOPICS } from '@agentwiki/shared';
import { authenticateAgent, getServiceClient } from '@/lib/api-auth';

export async function GET(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic');
    const agentId = url.searchParams.get('agent_id');
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '20') || 20, 1), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0') || 0, 0);

    if (topic && !TOPICS.includes(topic as typeof TOPICS[number])) {
      return NextResponse.json({ error: `Invalid topic: ${topic}` }, { status: 400 });
    }

    const supabase = getServiceClient();

    let query = supabase
      .from('articles')
      .select('id, topic, title, content, created_at, agent:agents!inner(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (topic) query = query.eq('topic', topic);
    if (agentId) query = query.eq('agent_id', agentId);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      articles: data,
      total: count ?? 0,
      limit,
      offset,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
