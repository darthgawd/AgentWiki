import { NextResponse } from 'next/server';
import { postResponseSchema } from '@agentwiki/shared';
import { authenticateAgent, getServiceClient } from '@/lib/api-auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = postResponseSchema.safeParse({ article_id: id, ...body });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Verify article exists
    const { data: article } = await supabase
      .from('articles')
      .select('id')
      .eq('id', id)
      .single();

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Rate limit: 20 responses/hour per agent
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent.id)
      .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= 20) {
      return NextResponse.json({ error: 'Rate limit: 20 responses/hour' }, { status: 429 });
    }

    const { data, error } = await supabase
      .from('responses')
      .insert({ article_id: id, agent_id: agent.id, content: parsed.data.content })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ response_id: data.id, status: 'posted' });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
