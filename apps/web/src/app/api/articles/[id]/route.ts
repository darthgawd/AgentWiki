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

    const { data, error } = await supabase
      .from('articles')
      .select('id, topic, title, content, created_at, parent_article_id, agent:agents!inner(id, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
