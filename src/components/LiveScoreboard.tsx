'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchIPLMatches, getDemoIPLMatch, IPLMatchState } from '@/lib/cricapi';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// ─── Real-time Clock Bar ────────────────────────────────────────────────
export function ClockBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const dateStr = format(now, 'EEEE, d MMMM yyyy');   // "Wednesday, 14 May 2026"
  const timeStr = format(now, 'HH:mm:ss');             // "01:15:42"

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '12px', padding: '0.6rem 1.25rem', marginBottom: '1.5rem',
      fontSize: '0.875rem', color: 'var(--text-muted)'
    }}>
      <span>📅 {dateStr}</span>
      <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'white', fontWeight: 700 }}>
        🕐 {timeStr} IST
      </span>
    </div>
  );
}

// ─── Ball-by-ball mini strip ────────────────────────────────────────────
const DEMO_BALLS = ['1', 'W', '4', '0', '6', '2'];

function BallStrip() {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
      {DEMO_BALLS.map((b, i) => (
        <span key={i} style={{
          width: 28, height: 28, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
          fontWeight: 700,
          background: b === 'W' ? 'rgba(239,68,68,0.4)'
            : b === '6' ? 'rgba(168,85,247,0.4)'
            : b === '4' ? 'rgba(99,102,241,0.4)'
            : 'rgba(255,255,255,0.1)',
          color: b === 'W' ? '#fca5a5' : b === '6' ? '#d8b4fe' : 'white'
        }}>{b}</span>
      ))}
      <span style={{ width: 28, height: 28, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
    </div>
  );
}

// ─── Live Scoreboard ────────────────────────────────────────────────────
export function LiveScoreboard({ onMatchLoad }: { onMatchLoad?: (m: IPLMatchState) => void }) {
  const [match, setMatch] = useState<IPLMatchState | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMatch = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_CRICKET_API_KEY;
    let m: IPLMatchState;
    if (apiKey) {
      const matches = await fetchIPLMatches();
      m = matches.length > 0 ? matches[0] : getDemoIPLMatch();
    } else {
      m = getDemoIPLMatch();
    }
    setMatch(m);
    onMatchLoad?.(m);
    setLastUpdated(new Date());
  }, [onMatchLoad]);

  useEffect(() => {
    loadMatch();
    // Refresh every 30 seconds
    const id = setInterval(loadMatch, 30_000);
    return () => clearInterval(id);
  }, [loadMatch]);

  if (!match) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}>🏏</div>
        Loading IPL live scores…
      </div>
    );
  }

  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';

  return (
    <div className="glass-card" style={{
      padding: '1.5rem',
      background: isLive
        ? 'linear-gradient(135deg, rgba(20,25,40,0.9), rgba(99,102,241,0.15))'
        : 'rgba(20,25,40,0.6)',
      borderColor: isLive ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isLive && <span className="live-dot" style={{ display: 'inline-block' }} />}
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            {match.shortA} vs {match.shortB}
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
              · IPL 2026
            </span>
          </h2>
        </div>
        <div style={{
          padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
          background: isLive ? 'rgba(239,68,68,0.2)' : isUpcoming ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
          color: isLive ? '#fca5a5' : isUpcoming ? '#fcd34d' : '#6ee7b7',
          border: `1px solid ${isLive ? 'rgba(239,68,68,0.4)' : isUpcoming ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'}`
        }}>
          {isLive ? '🔴 LIVE' : isUpcoming ? '⏰ UPCOMING' : '✅ DONE'}
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        📍 {match.venue}
      </p>

      {/* Score Section */}
      {isUpcoming ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {match.teamA} <span style={{ color: 'var(--text-muted)' }}>vs</span> {match.teamB}
          </div>
          <div style={{ color: 'var(--warning)', fontWeight: 600 }}>
            🗓 {match.dateTimeGMT ? format(new Date(match.dateTimeGMT), 'dd MMM, h:mm a') + ' UTC' : 'TBA'}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{match.teamA}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                {match.score.teamA || '—'}
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', padding: '0 1rem' }}>vs</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{match.teamB}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: match.score.teamB ? 'var(--accent)' : 'var(--text-muted)', lineHeight: 1 }}>
                {match.score.teamB || '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              {match.statusText}
            </p>
            {isLive && <BallStrip />}
          </div>
        </>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>
          Updated {format(lastUpdated, 'HH:mm:ss')} · Auto-refreshes every 30s
        </div>
      )}
    </div>
  );
}
