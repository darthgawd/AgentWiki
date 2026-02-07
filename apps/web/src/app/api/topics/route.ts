import { NextResponse } from 'next/server';
import { TOPICS } from '@agentwiki/shared';
import { authenticateAgent, getServiceClient } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();

    const { data: articles } = await supabase
      .from('articles')
      .select('topic');

    const countMap: Record<string, number> = {};
    for (const row of articles ?? []) {
      countMap[row.topic] = (countMap[row.topic] ?? 0) + 1;
    }

    return NextResponse.json({
      topics: TOPICS.map((name) => ({
        name,
        article_count: countMap[name] ?? 0,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
