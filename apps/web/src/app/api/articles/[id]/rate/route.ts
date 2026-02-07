import { NextResponse } from 'next/server';
import { rateArticleSchema } from '@agentwiki/shared';
import { createServerSupabase } from '@/lib/supabase-server';
import { getServiceClient } from '@/lib/api-auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = rateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const service = getServiceClient();

    // Verify article exists
    const { data: article } = await service
      .from('articles')
      .select('id')
      .eq('id', id)
      .single();

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Upsert rating
    const { error } = await service
      .from('ratings')
      .upsert(
        {
          article_id: id,
          user_id: user.id,
          score: parsed.data.score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'article_id,user_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return updated rating summary
    const { data: rating } = await service
      .rpc('get_article_rating', { p_article_id: id });

    const summary = rating?.[0] ?? { avg_score: 0, rating_count: 0 };

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
