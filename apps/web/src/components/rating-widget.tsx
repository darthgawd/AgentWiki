'use client';

import { useState } from 'react';

interface RatingWidgetProps {
  articleId: string;
  initialAvg: number;
  initialCount: number;
  initialUserScore: number | null;
}

export function RatingWidget({ articleId, initialAvg, initialCount, initialUserScore }: RatingWidgetProps) {
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [userScore, setUserScore] = useState(initialUserScore);
  const [hovering, setHovering] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticated = initialUserScore !== null || initialUserScore === null;

  async function handleRate(score: number) {
    if (submitting) return;
    setSubmitting(true);

    // Optimistic update
    const prevAvg = avg;
    const prevCount = count;
    const prevUserScore = userScore;

    if (userScore === null) {
      // New rating
      const newCount = count + 1;
      const newAvg = Math.round(((avg * count + score) / newCount) * 10) / 10;
      setAvg(newAvg);
      setCount(newCount);
    } else {
      // Updated rating
      const newAvg = count > 0
        ? Math.round(((avg * count - userScore + score) / count) * 10) / 10
        : score;
      setAvg(newAvg);
    }
    setUserScore(score);

    try {
      const res = await fetch(`/api/articles/${articleId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          // Not authenticated — revert and show nothing
          setAvg(prevAvg);
          setCount(prevCount);
          setUserScore(prevUserScore);
          return;
        }
        throw new Error(data.error || 'Failed to rate');
      }

      const data = await res.json();
      setAvg(Number(data.avg_score));
      setCount(Number(data.rating_count));
    } catch {
      // Revert on error
      setAvg(prevAvg);
      setCount(prevCount);
      setUserScore(prevUserScore);
    } finally {
      setSubmitting(false);
    }
  }

  const displayScore = hovering ?? userScore ?? 0;

  return (
    <div className="border border-border">
      <div className="bg-surface px-4 py-2 border-b border-border">
        <span className="text-sm font-bold text-ink">Community Rating</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="text-lg cursor-pointer hover:scale-110 transition-transform disabled:cursor-default"
              onMouseEnter={() => setHovering(star)}
              onMouseLeave={() => setHovering(null)}
              onClick={() => handleRate(star)}
              disabled={submitting}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              {star <= displayScore ? '★' : '☆'}
            </button>
          ))}
        </div>
        <div className="text-sm text-faint">
          {count > 0 ? (
            <>
              <span className="text-ink font-medium">{avg}</span>/5
              {' '}from {count} rating{count !== 1 ? 's' : ''}
            </>
          ) : (
            'No ratings yet'
          )}
        </div>
        {userScore && (
          <div className="text-xs text-faint mt-1">
            Your rating: {userScore}/5
          </div>
        )}
      </div>
    </div>
  );
}
