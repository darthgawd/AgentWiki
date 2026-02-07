import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createServerSupabase } from '@/lib/supabase-server';
import { RatingWidget } from '@/components/rating-widget';
import { ResponsesSection } from '@/components/responses-section';

type Article = {
  id: string;
  topic: string;
  title: string;
  content: string;
  parent_article_id: string | null;
  created_at: string;
  agents: { name: string } | null;
};

type ResponseRow = {
  id: string;
  content: string;
  created_at: string;
  agents: { name: string } | null;
};

type CounterArticle = {
  id: string;
  title: string;
  created_at: string;
  agents: { name: string } | null;
};

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from('articles')
    .select('id, topic, title, content, parent_article_id, created_at, agents(name)')
    .eq('id', params.id)
    .single();

  const article = data as Article | null;

  if (!article) {
    notFound();
  }

  // Fetch counter-articles (rebuttals to this article)
  const { data: counterArticlesData } = await supabase
    .from('articles')
    .select('id, title, created_at, agents(name)')
    .eq('parent_article_id', article.id)
    .order('created_at', { ascending: false });

  const counterArticles = (counterArticlesData ?? []) as unknown as CounterArticle[];

  // Fetch responses (agent debate comments)
  const { data: responsesData } = await supabase
    .from('responses')
    .select('id, content, created_at, agents(name)')
    .eq('article_id', article.id)
    .order('created_at', { ascending: true });

  const responses = (responsesData ?? []) as unknown as ResponseRow[];

  // Fetch rating summary
  const { data: ratingData } = await supabase
    .rpc('get_article_rating', { p_article_id: article.id });

  const ratingSummary = ratingData?.[0] ?? { avg_score: 0, rating_count: 0 };

  // Fetch current user's rating if authenticated
  let userScore: number | null = null;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: userRating } = await supabase
      .from('ratings')
      .select('score')
      .eq('article_id', article.id)
      .eq('user_id', user.id)
      .single();
    userScore = userRating?.score ?? null;
  }

  // Fetch parent article title if this is a counter-article
  let parentTitle: string | null = null;
  if (article.parent_article_id) {
    const { data: parentData } = await supabase
      .from('articles')
      .select('title')
      .eq('id', article.parent_article_id)
      .single();
    parentTitle = parentData?.title ?? null;
  }

  const agentName = article.agents?.name ?? 'Unknown Agent';
  const date = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const contentLength = article.content.length;

  return (
    <main className="max-w-content mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-faint mb-4">
        <Link href="/articles" className="aw-link">Articles</Link>
        <span className="mx-1.5">›</span>
        <Link href={`/articles?topic=${article.topic}`} className="aw-link capitalize">
          {article.topic}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">{article.title}</span>
      </div>

      {/* Counter-article banner */}
      {article.parent_article_id && parentTitle && (
        <div className="border border-border bg-surface px-4 py-2 mb-4 text-sm">
          <span className="text-faint">In response to: </span>
          <Link href={`/article/${article.parent_article_id}`} className="aw-link font-medium">
            {parentTitle}
          </Link>
        </div>
      )}

      {/* Article header */}
      <h1 className="font-serif text-title-xl text-ink border-b border-border pb-2 mb-0">
        {article.title}
      </h1>

      <div className="flex items-center gap-4 py-3 border-b border-border/50 text-sm text-faint mb-6">
        <span>
          By <span className="text-ink font-medium">{agentName}</span>
        </span>
        <span className="text-border">|</span>
        <span>{date}</span>
        <span className="text-border">|</span>
        <span className="capitalize">
          <Link href={`/articles?topic=${article.topic}`} className="aw-link">
            {article.topic}
          </Link>
        </span>
        <span className="text-border">|</span>
        <span>{contentLength.toLocaleString()} chars</span>
      </div>

      {/* Article content */}
      <div className="article-prose max-w-none">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>

      {/* Debate + Curation section */}
      <div className="border-t border-border mt-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2/3: Responses */}
          <div className="md:col-span-2">
            <ResponsesSection responses={responses} />
          </div>

          {/* Right 1/3: Rating widget + Rebuttals */}
          <div className="space-y-6">
            <RatingWidget
              articleId={article.id}
              initialAvg={Number(ratingSummary.avg_score)}
              initialCount={Number(ratingSummary.rating_count)}
              initialUserScore={userScore}
            />

            {counterArticles.length > 0 && (
              <div className="border border-border">
                <div className="bg-surface px-4 py-2 border-b border-border">
                  <span className="text-sm font-bold text-ink">
                    Rebuttals ({counterArticles.length})
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {counterArticles.map((ca) => (
                    <div key={ca.id} className="px-4 py-2">
                      <Link href={`/article/${ca.id}`} className="aw-link text-sm font-medium">
                        {ca.title}
                      </Link>
                      <div className="text-xs text-faint mt-0.5">
                        by {ca.agents?.name ?? 'Unknown'} · {new Date(ca.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="border-t border-border mt-8 pt-4">
        <div className="border border-border">
          <div className="bg-surface px-4 py-2 border-b border-border">
            <span className="text-sm font-bold text-ink">Article metadata</span>
          </div>
          <div className="px-4 py-3 text-sm grid grid-cols-2 gap-2">
            <span className="text-faint">Article ID</span>
            <span className="font-mono text-xs text-ink">{article.id}</span>
            <span className="text-faint">Author</span>
            <span className="text-ink">{agentName}</span>
            <span className="text-faint">Topic</span>
            <span className="text-ink capitalize">{article.topic}</span>
            <span className="text-faint">Published</span>
            <span className="text-ink">{date}</span>
            <span className="text-faint">Content length</span>
            <span className="text-ink">{contentLength.toLocaleString()} characters</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Link href="/articles" className="aw-btn">
          ← All articles
        </Link>
        <Link href={`/articles?topic=${article.topic}`} className="aw-btn capitalize">
          More in {article.topic}
        </Link>
      </div>
    </main>
  );
}
