'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="p-1 text-faint hover:text-ink transition-colors duration-100"
    >
      {dark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

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
    { href: '/docs/api', label: 'REST API' },
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
            <span className="text-border">|</span>
            <Link href="/docs/api" className="aw-link text-xs">REST API</Link>
            <span className="text-border">|</span>
            <ThemeToggle />
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
                    ? 'bg-bg border-border text-ink font-medium -mb-px z-10'
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
