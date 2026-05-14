'use client';

import { useState, useEffect, useRef } from 'react';
import { generateCommentary, generateMoodInsight } from '@/lib/gemini';

// ─── AI Commentator ────────────────────────────────────────────────────────
interface Commentary {
  id: number;
  text: string;
  isAI: boolean;
  won?: boolean;
}

const DEMO_COMMENTS: Commentary[] = [
  { id: 1, text: "📡 AI Commentator is watching every ball...", isAI: true },
  { id: 2, text: "🔥 Kohli at the crease — this is the moment fans predicted!", isAI: true },
];

export function AICommentatorPanel({
  username,
  lastPrediction,
}: {
  username: string;
  lastPrediction?: { prediction: string; outcome: string; won: boolean };
}) {
  const [comments, setComments] = useState<Commentary[]>(DEMO_COMMENTS);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  useEffect(() => {
    if (!lastPrediction) return;
    setLoading(true);

    generateCommentary(
      username,
      lastPrediction.prediction,
      lastPrediction.outcome,
      lastPrediction.won,
      "IPL 2026 — MI vs CSK, 15th over, high pressure chase"
    ).then(text => {
      if (text) {
        setComments(prev => [...prev, {
          id: Date.now(),
          text,
          isAI: true,
          won: lastPrediction.won
        }]);
      }
      setLoading(false);
    });
  }, [lastPrediction, username]);

  // Demo: add a new AI comment every 45s to simulate live commentary
  useEffect(() => {
    const demoLines = [
      "⚡ Over 16 begins — can MI hold their nerve?",
      "🎯 The crowd oracle says 68% of fans expect a boundary!",
      "🏏 Rohit's power game is exactly what MI needed right now.",
    ];
    let i = 0;
    const id = setInterval(() => {
      setComments(prev => [...prev, { id: Date.now(), text: demoLines[i % demoLines.length], isAI: true }]);
      i++;
    }, 45_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '320px', position: 'relative', overflow: 'hidden' }}>
      {/* Header glow */}
      <div style={{ position: 'absolute', top: -30, left: -30, width: 100, height: 100, background: 'var(--secondary)', filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎙️ AI Commentator
        </h3>
        <span style={{ fontSize: '0.75rem', background: 'rgba(236,72,153,0.15)', color: '#f9a8d4', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(236,72,153,0.3)' }}>
          Powered by Gemini
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {comments.map(c => (
          <div key={c.id} style={{
            background: c.won === true ? 'rgba(16,185,129,0.1)' : c.won === false ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${c.won === true ? 'rgba(16,185,129,0.25)' : c.won === false ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '10px', padding: '0.6rem 0.875rem',
            fontSize: '0.9rem', lineHeight: 1.5
          }}>
            {c.text}
          </div>
        ))}
        {loading && (
          <div style={{ padding: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ animation: 'pulse 1s infinite' }}>✍️</span> Gemini is commenting…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Live Fan Mood Meter ───────────────────────────────────────────────────
export function FanMoodMeter({ messages }: { messages: string[] }) {
  const [mood, setMood] = useState<{ mood: string; score: number; summary: string }>({
    mood: 'hyped', score: 72, summary: 'Fans are absolutely buzzing! 🔥'
  });

  useEffect(() => {
    if (messages.length < 3) return;
    generateMoodInsight(messages).then(setMood);
  }, [messages.length]);  // re-analyze when message count changes (every ~5 msgs)

  const moodConfig: Record<string, { emoji: string; color: string; bg: string }> = {
    hyped:      { emoji: '🔥', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    frustrated: { emoji: '😤', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    tense:      { emoji: '😬', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    neutral:    { emoji: '😐', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  };

  const cfg = moodConfig[mood.mood] || moodConfig.neutral;

  return (
    <div className="glass-card" style={{ background: cfg.bg, borderColor: cfg.color + '33' }}>
      <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {cfg.emoji} Fan Mood Meter
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: cfg.color }}>{mood.score}%</div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${mood.score}%`, background: cfg.color, borderRadius: 8, transition: 'width 1s ease' }} />
          </div>
          <div style={{ textTransform: 'capitalize', marginTop: '0.25rem', color: cfg.color, fontWeight: 600, fontSize: '0.875rem' }}>{mood.mood}</div>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{mood.summary}</p>
    </div>
  );
}
