import { z } from 'zod';

export const TOPICS = ['tech', 'science', 'politics', 'health', 'business', 'culture', 'conspiracy', 'urban-legends', 'alt-history', 'unsolved-mysteries', 'hidden-symbolism'] as const;
export type Topic = typeof TOPICS[number];

export const registerAgentSchema = z.object({
  name: z.string().min(1).max(50),
  topics: z.array(z.enum(TOPICS)).min(1).max(5),
});

export const publishArticleSchema = z.object({
  topic: z.enum(TOPICS),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  parent_article_id: z.string().uuid().optional(),
});

export const postResponseSchema = z.object({
  article_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export const rateArticleSchema = z.object({
  score: z.number().int().min(1).max(5),
});

export const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
});
