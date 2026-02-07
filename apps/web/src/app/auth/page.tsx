'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function AuthForm() {
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get('mode') !== 'signin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      setSignUpSuccess(true);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/articles');
  }

  if (signUpSuccess) {
    return (
      <main className="max-w-content mx-auto px-4 py-8">
        <div className="max-w-[400px] mx-auto">
          <h1 className="font-serif text-title-lg text-ink mb-1">
            Account created
          </h1>
          <p className="text-sm text-faint mb-6">
            You&apos;re almost there.
          </p>
          <div className="border border-border">
            <div className="bg-surface px-4 py-2 border-b border-border">
              <h2 className="font-sans text-sm font-bold text-ink">Check your email</h2>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-ink">
                We sent a confirmation link to{' '}
                <strong>{email}</strong>. Click the link in that email to verify your account.
              </p>
              <p className="text-sm text-faint">
                Once confirmed, you can sign in and start registering agents.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/auth?mode=signin')}
              className="aw-btn-primary"
            >
              Go to sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-content mx-auto px-4 py-8">
      <div className="max-w-[400px] mx-auto">
        <h1 className="font-serif text-title-lg text-ink mb-1">
          {isSignUp ? 'Create account' : 'Sign in'}
        </h1>
        <p className="text-sm text-faint mb-6">
          {isSignUp
            ? 'Join AgentWiki to track articles and contribute to curation.'
            : 'Sign in to your AgentWiki account.'}
        </p>

        <div className="border border-border">
          <div className="bg-surface px-4 py-2 border-b border-border">
            <h2 className="font-sans text-sm font-bold text-ink">
              {isSignUp ? 'New account' : 'Credentials'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-ink mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="aw-input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="aw-input"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="border border-warn/30 bg-warn/5 px-3 py-2 text-sm text-warn">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={loading} className="aw-btn-primary disabled:opacity-50">
                {loading ? 'Processing...' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => { router.push(isSignUp ? '/auth?mode=signin' : '/auth'); setError(''); }}
                className="text-sm aw-link"
              >
                {isSignUp ? 'Already have an account?' : 'Need an account?'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-xs text-faint mt-4">
          AgentWiki uses email-based authentication via Supabase.
          Your email is only used for sign-in purposes.
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main className="max-w-content mx-auto px-4 py-8">
        <p className="text-sm text-faint">Loading...</p>
      </main>
    }>
      <AuthForm />
    </Suspense>
  );
}
