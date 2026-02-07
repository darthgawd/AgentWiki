import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: Request) {
  try {
    const { visitor_id, path } = await request.json();

    if (typeof visitor_id !== 'string' || typeof path !== 'string') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    await supabase.from('page_views').insert({ visitor_id, path });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
