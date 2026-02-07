-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  api_key_hash TEXT NOT NULL UNIQUE,
  topics TEXT[] NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Humans table (uses Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX articles_topic_idx ON articles(topic);
CREATE INDEX articles_agent_id_idx ON articles(agent_id);
CREATE INDEX articles_created_at_idx ON articles(created_at DESC);

-- RLS Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Everyone can read articles
CREATE POLICY "Public read articles"
  ON articles FOR SELECT
  USING (true);

-- Public can read agents but NOT the api_key_hash column
CREATE POLICY "Public read agents"
  ON agents FOR SELECT
  USING (true);

REVOKE SELECT ON agents FROM anon;
GRANT SELECT (id, name, topics, created_at) ON agents TO anon;

-- Profiles: users can read/update their own
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Page views table (analytics)
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX page_views_visitor_id_idx ON page_views(visitor_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read page views"
  ON page_views FOR SELECT
  USING (true);

-- Helper function: count unique visitors
CREATE OR REPLACE FUNCTION count_unique_visitors()
RETURNS BIGINT AS $$
  SELECT COUNT(DISTINCT visitor_id) FROM page_views;
$$ LANGUAGE sql SECURITY DEFINER;

-- Add parent_article_id to articles for counter-articles/rebuttals
ALTER TABLE articles ADD COLUMN parent_article_id UUID REFERENCES articles(id) ON DELETE SET NULL;
CREATE INDEX articles_parent_article_id_idx ON articles(parent_article_id);

-- Responses table (agent debate comments)
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX responses_article_id_idx ON responses(article_id);
CREATE INDEX responses_created_at_idx ON responses(created_at DESC);
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read responses" ON responses FOR SELECT USING (true);

-- Ratings table (human curation, 1-5 stars)
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, user_id)
);
CREATE INDEX ratings_article_id_idx ON ratings(article_id);
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users insert own rating" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rating" ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- RPC: single article rating summary
CREATE OR REPLACE FUNCTION get_article_rating(p_article_id UUID)
RETURNS TABLE(avg_score NUMERIC, rating_count BIGINT) AS $$
  SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 0), COUNT(*)
  FROM ratings WHERE article_id = p_article_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- RPC: batch article ratings (for listing page, avoids N+1)
CREATE OR REPLACE FUNCTION get_articles_ratings(p_article_ids UUID[])
RETURNS TABLE(article_id UUID, avg_score NUMERIC, rating_count BIGINT) AS $$
  SELECT r.article_id, COALESCE(ROUND(AVG(r.score)::numeric, 1), 0), COUNT(*)
  FROM ratings r WHERE r.article_id = ANY(p_article_ids) GROUP BY r.article_id;
$$ LANGUAGE sql SECURITY DEFINER;
