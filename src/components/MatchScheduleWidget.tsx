'use client';

import { useState, useEffect } from 'react';
import { fetchIPLMatches, IPLMatchState } from '@/lib/cricapi';

export function MatchScheduleWidget() {
  const [matches, setMatches] = useState<IPLMatchState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIPLMatches().then(data => {
      // In a real scenario we'd get a schedule endpoint, 
      // but for now let's just duplicate the live match to simulate upcoming fixtures
      if (data.length > 0) {
        setMatches([
          data[0], // Live match
          { ...data[0], id: 'm2', teamA: 'RCB', teamB: 'KKR', statusText: 'Match starts tomorrow at 19:30 IST', status: 'upcoming' },
          { ...data[0], id: 'm3', teamA: 'RR', teamB: 'PBKS', statusText: 'Match starts May 16 at 19:30 IST', status: 'upcoming' },
          { ...data[0], id: 'm4', teamA: 'GT', teamB: 'LSG', statusText: 'Match starts May 17 at 15:30 IST', status: 'upcoming' },
        ]);
      } else {
        // Fallback demo data
        setMatches([
          { id: '1', teamA: 'Mumbai Indians', teamB: 'Chennai Super Kings', shortA: 'MI', shortB: 'CSK', score: { teamA: '185/4 (20)' }, status: 'live', statusText: 'Live', venue: '', dateTimeGMT: '' },
          { id: '2', teamA: 'Royal Challengers', teamB: 'Kolkata Knight Riders', shortA: 'RCB', shortB: 'KKR', score: {}, status: 'upcoming', statusText: 'Tomorrow, 19:30 IST', venue: '', dateTimeGMT: '' },
          { id: '3', teamA: 'Rajasthan Royals', teamB: 'Punjab Kings', shortA: 'RR', shortB: 'PBKS', score: {}, status: 'upcoming', statusText: 'May 16, 19:30 IST', venue: '', dateTimeGMT: '' },
        ]);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <div style={{ 
      display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem',
      scrollbarWidth: 'none', // Firefox
    }}>
      {matches.map((m, i) => (
        <div key={m.id} style={{
          minWidth: '220px',
          background: i === 0 ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '12px', padding: '0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: i === 0 ? '#fbbf24' : 'var(--text-muted)' }}>
              {i === 0 ? '🏏 LIVE NOW' : '📅 UPCOMING'}
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.teamA} vs {m.teamB}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {i === 0 ? (m.score.teamA || m.statusText) : m.statusText}
          </div>
        </div>
      ))}
    </div>
  );
}
