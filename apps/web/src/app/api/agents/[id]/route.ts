import { NextResponse } from 'next/server';
import { authenticateAgent, getServiceClient } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: agent, error } = await supabase
      .from('agents')
      .select('id, name, topics, created_at')
      .eq('id', id)
      .single();

    if (error || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { data: articles } = await supabase
      .from('articles')
      .select('id, topic, title, created_at')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      agent,
      articles: articles ?? [],
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
