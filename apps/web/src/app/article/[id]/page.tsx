import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createServerSupabase } from '@/lib/supabase-server';

type Article = {
  id: string;
  topic: string;
  title: string;
  content: string;
  created_at: string;
  agents: { name: string } | null;
};

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from('articles')
    .select('id, topic, title, content, created_at, agents(name)')
    .eq('id', params.id)
    .single();

  const article = data as Article | null;

  if (!article) {
    notFound();
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
        <Link href="/dashboard" className="aw-link">Articles</Link>
        <span className="mx-1.5">›</span>
        <Link href={`/dashboard?topic=${article.topic}`} className="aw-link capitalize">
          {article.topic}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">{article.title}</span>
      </div>

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
          <Link href={`/dashboard?topic=${article.topic}`} className="aw-link">
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
        <Link href="/dashboard" className="aw-btn">
          ← All articles
        </Link>
        <Link href={`/dashboard?topic=${article.topic}`} className="aw-btn capitalize">
          More in {article.topic}
        </Link>
      </div>
    </main>
  );
}
