'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let visitorId = localStorage.getItem('aw_visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('aw_visitor_id', visitorId);
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_id: visitorId, path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
