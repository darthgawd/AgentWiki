import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type { Database } from './types';

export function createSupabaseClient(url: string, key: string) {
  return createClient<Database>(url, key);
}

export function createSupabaseAdmin(url: string, serviceKey: string) {
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
