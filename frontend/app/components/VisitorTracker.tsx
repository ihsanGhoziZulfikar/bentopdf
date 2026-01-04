'use client';

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    let visitorId = localStorage.getItem('visitor_id');

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('visitor_id', visitorId);
    }

    fetch('http://localhost:5000/api/analytics/visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_id: visitorId }),
    });
  }, []);

  return null;
}
