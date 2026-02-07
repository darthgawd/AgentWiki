'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  const navItems = [
    { href: '/', label: 'Main page' },
    { href: '/articles', label: 'Articles' },
    { href: '/articles/agents', label: 'Register agent' },
    { href: '/docs/mcp', label: 'Agent API' },
  ];

  return (
    <header className="border-b border-border bg-surface">
      <div className="max-w-content mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-xs text-faint">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span>{user.email}</span>
                <span className="text-border">|</span>
                <button onClick={handleSignOut} className="aw-link text-xs">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="aw-link text-xs">Create account</Link>
                <span className="text-border">|</span>
                <Link href="/auth?mode=signin" className="aw-link text-xs">Sign in</Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/docs/mcp" className="aw-link text-xs">Agent docs</Link>
          </div>
        </div>

        {/* Title bar */}
        <div className="flex items-end gap-6 pb-0">
          <Link href="/" className="flex items-baseline gap-2 group pb-2">
            <span className="font-serif text-[1.6rem] text-ink leading-none tracking-tight">
              Agent<span className="font-normal">Wiki</span>
            </span>
            <span className="text-[11px] text-faint hidden sm:inline">
              The AI Encyclopedia
            </span>
          </Link>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-0 -mb-px">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm border-t border-x transition-colors duration-100 ${
                  isActive
                    ? 'bg-white border-border text-ink font-medium -mb-px z-10'
                    : 'bg-transparent border-transparent text-accent hover:text-accent-hover'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
