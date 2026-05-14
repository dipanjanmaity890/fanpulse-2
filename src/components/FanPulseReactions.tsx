'use client';

import { useState, useEffect, useRef } from 'react';

// ── Floating Reaction Bubble ───────────────────────────────────────────────
interface Bubble { id: number; emoji: string; x: number; }

// ── Reaction Data ──────────────────────────────────────────────────────────
const REACTIONS = [
  { emoji: '🔥', label: 'Fire',     color: '#f97316' },
  { emoji: '😱', label: 'OMG',      color: '#a855f7' },
  { emoji: '🎉', label: 'Party',    color: '#ec4899' },
  { emoji: '💪', label: 'Power',    color: '#6366f1' },
  { emoji: '😤', label: 'Intense',  color: '#ef4444' },
  { emoji: '🏏', label: 'Cricket',  color: '#14b8a6' },
];

// Simulated live counts from "all fans" — refreshes every ~10s
function getSimCounts(): Record<string, number> {
  return {
    '🔥': 4820 + Math.floor(Math.random() * 200),
    '😱': 2130 + Math.floor(Math.random() * 150),
    '🎉': 3490 + Math.floor(Math.random() * 180),
    '💪': 1870 + Math.floor(Math.random() * 100),
    '😤': 1340 + Math.floor(Math.random() * 90),
    '🏏': 5210 + Math.floor(Math.random() * 250),
  };
}

export function FanPulseReactions() {
  const [counts, setCounts]   = useState<Record<string, number>>(getSimCounts);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [myReactions, setMyReactions] = useState<Record<string, boolean>>({});
  const [lastReaction, setLastReaction] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refresh global counts every 12s to simulate live fan activity
  useEffect(() => {
    const id = setInterval(() => setCounts(getSimCounts()), 12_000);
    return () => clearInterval(id);
  }, []);

  // Auto-clean old bubbles
  useEffect(() => {
    const id = setInterval(() => {
      setBubbles(prev => prev.filter(b => Date.now() - b.id < 2500));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const react = (emoji: string) => {
    // Add to count
    setCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setMyReactions(prev => ({ ...prev, [emoji]: true }));
    setLastReaction(emoji);

    // Spawn floating bubble
    const x = 10 + Math.random() * 80;
    const id = Date.now() + Math.random();
    setBubbles(prev => [...prev, { id, emoji, x }]);
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const topEmoji = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: '#ec4899', filter: 'blur(70px)', opacity: 0.12, borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ⚡ Fan Pulse
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {total.toLocaleString()} reactions live
        </span>
      </div>

      {/* Trending */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Trending: <strong style={{ color: 'white' }}>{topEmoji?.[0]} {topEmoji?.[1].toLocaleString()} fans</strong>
      </div>

      {/* Reaction buttons */}
      <div ref={containerRef} style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {/* Floating bubbles */}
        {bubbles.map(b => (
          <div key={b.id} style={{
            position: 'absolute', left: `${b.x}%`, bottom: 0, pointerEvents: 'none',
            fontSize: '1.4rem', animation: 'floatUp 2.4s ease-out forwards', zIndex: 10,
          }}>
            {b.emoji}
          </div>
        ))}

        {REACTIONS.map(r => {
          const pct = total > 0 ? Math.round((counts[r.emoji] / total) * 100) : 0;
          const active = myReactions[r.emoji];
          return (
            <button
              key={r.emoji}
              onClick={() => react(r.emoji)}
              style={{
                position: 'relative', border: 'none', borderRadius: '14px', padding: '0.6rem 0.4rem',
                background: active ? `${r.color}25` : 'rgba(255,255,255,0.05)',
                outline: active ? `1px solid ${r.color}60` : 'none',
                cursor: 'pointer', overflow: 'hidden', transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {/* Progress fill */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, height: `${pct}%`, width: '100%',
                background: `${r.color}18`, transition: 'height 0.8s ease', borderRadius: '0 0 14px 14px',
              }} />
              <span style={{ fontSize: '1.5rem', position: 'relative', filter: active ? `drop-shadow(0 0 6px ${r.color})` : 'none' }}>{r.emoji}</span>
              <span style={{ fontSize: '0.7rem', color: active ? r.color : 'var(--text-muted)', fontWeight: active ? 700 : 400, position: 'relative' }}>
                {counts[r.emoji] >= 1000 ? `${(counts[r.emoji] / 1000).toFixed(1)}k` : counts[r.emoji]}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', position: 'relative' }}>{pct}%</span>
            </button>
          );
        })}
      </div>

      {/* Your last reaction */}
      {lastReaction && (
        <div style={{
          textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)',
          padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px'
        }}>
          You reacted {lastReaction} · Tap again to add more!
        </div>
      )}

      {/* Live pulse bar */}
      <div style={{ marginTop: '0.875rem', display: 'flex', gap: '2px', height: 6, borderRadius: 8, overflow: 'hidden' }}>
        {REACTIONS.map((r) => (
          <div key={r.emoji} style={{
            flex: counts[r.emoji],
            background: r.color,
            transition: 'flex 1s ease',
            borderRadius: 8,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
        {REACTIONS.map(r => (
          <span key={r.emoji} style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{r.emoji}</span>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          80%  { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-120px) scale(1.4); }
        }
      `}</style>
    </div>
  );
}
