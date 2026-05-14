'use client';

import { useState } from 'react';

interface PredictionOption {
  label: string;
  votes: number;
}

// Crowd Oracle component — aggregates all user predictions locally
// In production this would sync to Firebase RTDB for real multi-user data
const INITIAL_OPTIONS: PredictionOption[] = [
  { label: 'Dot Ball', votes: 142 },
  { label: 'Single/Double', votes: 389 },
  { label: 'Boundary (4 or 6)', votes: 721 },
  { label: 'Wicket', votes: 88 },
];

export function CrowdOracle({
  onVote,
}: {
  onVote?: (option: string) => void;
}) {
  const [options, setOptions] = useState<PredictionOption[]>(INITIAL_OPTIONS);
  const [voted, setVoted] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const totalVotes = options.reduce((s, o) => s + o.votes, 0);

  const handleVote = (label: string) => {
    if (voted) return;
    setOptions(prev =>
      prev.map(o => o.label === label ? { ...o, votes: o.votes + 1 } : o)
    );
    setVoted(label);
    setRevealed(true);
    onVote?.(label);
  };

  const maxVotes = Math.max(...options.map(o => o.votes));

  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* bg glow */}
      <div style={{ position: 'absolute', bottom: -40, right: -40, width: 120, height: 120, background: 'var(--primary)', filter: 'blur(60px)', opacity: 0.2, borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🧠 Crowd Oracle</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{totalVotes.toLocaleString()} fans voting</span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        What does the crowd think happens next ball?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {options.map(opt => {
          const pct = Math.round((opt.votes / totalVotes) * 100);
          const isWinner = opt.votes === maxVotes;
          const isVoted = voted === opt.label;

          return (
            <button
              key={opt.label}
              onClick={() => handleVote(opt.label)}
              disabled={!!voted}
              style={{
                position: 'relative', width: '100%', textAlign: 'left',
                padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                background: isVoted
                  ? 'rgba(99,102,241,0.25)'
                  : 'rgba(255,255,255,0.05)',
                color: 'white', cursor: voted ? 'default' : 'pointer',
                overflow: 'hidden', transition: 'all 0.2s'
              }}
            >
              {/* Progress fill */}
              {revealed && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: `${pct}%`, background: isWinner
                    ? 'rgba(99,102,241,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  transition: 'width 0.8s ease', borderRadius: '10px'
                }} />
              )}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {isWinner && revealed ? '👑 ' : ''}{opt.label}
                  {isVoted ? ' ✓' : ''}
                </span>
                {revealed && (
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: isWinner ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {voted && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {voted === options.reduce((a, b) => a.votes > b.votes ? a : b).label
            ? '🎯 You went with the crowd! Bold is better though...'
            : `🔮 You went contrarian against ${Math.round((options.find(o=>o.label===voted)!.votes/totalVotes)*100)}% of fans. Prove them wrong!`}
        </div>
      )}
    </div>
  );
}

// ─── Post Match Story ──────────────────────────────────────────────────────
export function PostMatchStory({
  username,
  onGenerate,
}: {
  username: string;
  onGenerate: () => Promise<string>;
}) {
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const text = await onGenerate();
    setStory(text);
    setLoading(false);
  };

  return (
    <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(20,25,40,0.9), rgba(168,85,247,0.1))', borderColor: 'rgba(168,85,247,0.3)' }}>
      <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📖 Your Match Story
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Let Gemini write your personal match highlight reel.
      </p>

      {!story ? (
        <button
          className="btn"
          onClick={generate}
          disabled={loading}
          style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          {loading
            ? '✍️ Gemini is writing your story…'
            : '✨ Generate My Story'}
        </button>
      ) : (
        <>
          <div style={{
            background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)',
            borderRadius: '12px', padding: '1.25rem', lineHeight: 1.7, fontSize: '0.95rem',
            marginBottom: '1rem'
          }}>
            {story}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigator.clipboard.writeText(story)}
              className="btn btn-outline"
              style={{ flex: 1, fontSize: '0.875rem' }}
            >
              📋 Copy
            </button>
            <button
              onClick={() => {
                const text = encodeURIComponent(`My #IPL match story on FanPulse 2.0:\n\n${story}\n\nhttps://fanpulse-live-match.web.app`);
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
              }}
              className="btn"
              style={{ flex: 1, fontSize: '0.875rem', background: '#1da1f2' }}
            >
              🐦 Share
            </button>
          </div>
        </>
      )}
    </div>
  );
}
