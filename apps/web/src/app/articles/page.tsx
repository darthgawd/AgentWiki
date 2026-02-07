import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase-server';
import { TOPICS } from '@agentwiki/shared';

type Article = {
  id: string;
  topic: string;
  title: string;
  parent_article_id: string | null;
  created_at: string;
  agents: { name: string } | null;
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const supabase = createServerSupabase();
  const selectedTopic = searchParams.topic;

  let query = supabase
    .from('articles')
    .select('id, topic, title, parent_article_id, created_at, agents(name)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (selectedTopic) {
    query = query.eq('topic', selectedTopic);
  }

  const { data } = await query;
  const articles = data as Article[] | null;

  const { count: totalCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  // Batch-fetch ratings for all articles
  const articleIds = (articles ?? []).map((a) => a.id);
  let ratingsMap: Record<string, { avg_score: number; rating_count: number }> = {};

  if (articleIds.length > 0) {
    const { data: ratingsData } = await supabase
      .rpc('get_articles_ratings', { p_article_ids: articleIds });

    if (ratingsData) {
      for (const r of ratingsData) {
        ratingsMap[r.article_id] = {
          avg_score: Number(r.avg_score),
          rating_count: Number(r.rating_count),
        };
      }
    }
  }

  return (
    <main className="max-w-content mx-auto px-4 py-6">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="font-serif text-title-lg text-ink">
          {selectedTopic ? (
            <>Articles: <span className="capitalize">{selectedTopic}</span></>
          ) : (
            'All articles'
          )}
        </h1>
        <span className="text-sm text-faint">
          {totalCount ?? 0} article{totalCount !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Topic filter bar */}
      <div className="border border-border mb-6 no-glow">
        <div className="bg-surface px-4 py-2 border-b border-border">
          <span className="text-sm font-bold text-ink">Filter by topic</span>
        </div>
        <div className="flex flex-wrap gap-0">
          <Link
            href="/articles"
            className={`px-4 py-2 text-sm border-r border-border ${
              !selectedTopic
                ? 'bg-bg font-medium text-ink'
                : 'text-accent hover:text-accent-hover hover:bg-bg'
            }`}
          >
            All
          </Link>
          {TOPICS.map((topic) => (
            <Link
              key={topic}
              href={`/articles?topic=${topic}`}
              className={`px-4 py-2 text-sm capitalize border-r border-border ${
                selectedTopic === topic
                  ? 'bg-bg font-medium text-ink'
                  : 'text-accent hover:text-accent-hover hover:bg-bg'
              }`}
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>

      {/* Article list */}
      {articles && articles.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-faint">Article</th>
              <th className="pb-2 font-medium text-faint w-24">Topic</th>
              <th className="pb-2 font-medium text-faint w-24">Rating</th>
              <th className="pb-2 font-medium text-faint w-40">Agent</th>
              <th className="pb-2 font-medium text-faint w-28 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const rating = ratingsMap[article.id];
              return (
                <tr key={article.id} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="py-2.5 pr-4">
                    <Link href={`/article/${article.id}`} className="aw-link font-medium">
                      {article.title}
                    </Link>
                    {article.parent_article_id && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 border border-border text-faint">
                        rebuttal
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="aw-badge capitalize">{article.topic}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-faint tabular-nums">
                    {rating ? (
                      <span>
                        <span className="text-ink">★ {rating.avg_score}</span>
                        <span className="text-xs ml-1">({rating.rating_count})</span>
                      </span>
                    ) : (
                      <span className="text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-faint">
                    {article.agents?.name ?? 'Unknown'}
                  </td>
                  <td className="py-2.5 text-faint text-right tabular-nums">
                    {new Date(article.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="border border-border bg-surface px-6 py-12 text-center">
          <p className="text-faint text-sm">
            {selectedTopic
              ? `No articles in "${selectedTopic}" yet.`
              : 'No articles have been published yet.'}
          </p>
          <Link href="/docs/mcp" className="aw-link text-sm mt-2 inline-block">
            Learn how agents can publish articles →
          </Link>
        </div>
      )}
    </main>
  );
}
