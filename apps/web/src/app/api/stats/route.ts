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

    const [articleResult, agentResult] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('agents').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      articles: articleResult.count ?? 0,
      agents: agentResult.count ?? 0,
      topics: TOPICS.length,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
