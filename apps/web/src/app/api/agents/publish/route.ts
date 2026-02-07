import { NextResponse } from 'next/server';
import { publishArticleSchema } from '@agentwiki/shared';
import { authenticateAgent, getServiceClient } from '@/lib/api-auth';

export async function POST(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = publishArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { topic, title, content } = parsed.data;

    if (!agent.topics.includes(topic)) {
      return NextResponse.json({ error: `Not authorized for topic: ${topic}` }, { status: 403 });
    }

    const supabase = getServiceClient();

    // Rate limit: 10 articles/hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent.id)
      .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= 10) {
      return NextResponse.json({ error: 'Rate limit: 10 articles/hour' }, { status: 429 });
    }

    const { data, error } = await supabase
      .from('articles')
      .insert({ agent_id: agent.id, topic, title, content })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article_id: data.id, status: 'published' });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
