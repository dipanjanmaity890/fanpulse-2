'use client';

import { useEffect, useState } from 'react';

// ─── Confetti Particle ─────────────────────────────────────────────────────
function Confetti() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    color: ['#6366f1', '#a855f7', '#f59e0b', '#14b8a6', '#ec4899', '#f97316'][Math.floor(Math.random() * 6)],
    rotation: Math.random() * 360,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Floating Crown Component ──────────────────────────────────────────────
export function FloatingCrown({ size = 48 }: { size?: number }) {
  return (
    <div style={{
      fontSize: size,
      display: 'inline-block',
      animation: 'crownFloat 2s ease-in-out infinite, crownGlow 2s ease-in-out infinite',
      filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.9))',
      transformOrigin: 'center bottom',
    }}>
      👑
    </div>
  );
}

// ─── Crown Takeover Popup ──────────────────────────────────────────────────
export function CrownTakeoverPopup({
  username,
  score,
  previousLeader,
  onClose,
}: {
  username: string;
  score: number;
  previousLeader?: string;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Stagger the entrance
    const t1 = setTimeout(() => setShow(true), 50);
    const t2 = setTimeout(() => setShowConfetti(true), 200);
    // Auto-dismiss after 8s
    const t3 = setTimeout(() => { setShow(false); setTimeout(onClose, 400); }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 400);
  };

  return (
    <>
      {showConfetti && <Confetti />}

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)', zIndex: 9999,
          opacity: show ? 1 : 0, transition: 'opacity 0.4s ease',
        }}
      />

      {/* Popup Card */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: show ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -60%) scale(0.85)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 10000, width: '90%', maxWidth: '460px',
        background: 'linear-gradient(135deg, rgba(15,18,30,0.98), rgba(99,102,241,0.2))',
        border: '1px solid rgba(251,191,36,0.5)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 0 60px rgba(251,191,36,0.3), 0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Radial glow behind crown */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Rank Down label */}
        {previousLeader && (
          <div style={{
            fontSize: '0.8rem', color: '#fca5a5', marginBottom: '1rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            padding: '0.3rem 1rem', borderRadius: '20px', display: 'inline-block'
          }}>
            📉 Dethroned: {previousLeader}
          </div>
        )}

        {/* Animated Crown */}
        <div style={{ marginBottom: '0.5rem', position: 'relative' }}>
          <FloatingCrown size={80} />
          {/* Orbit particles */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div key={deg} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 8, height: 8, borderRadius: '50%',
              background: '#fbbf24',
              animation: `orbitStar 3s linear infinite`,
              animationDelay: `${deg / 360 * 3}s`,
              transformOrigin: '50% 50%',
              transform: `rotate(${deg}deg) translate(60px) rotate(-${deg}deg)`,
              opacity: 0.7,
            }} />
          ))}
        </div>

        {/* Title */}
        <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
          👑 NEW CROWN TAKEN
        </div>
        <h1 style={{
          fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem',
          background: 'linear-gradient(135deg, #fbbf24, #f97316, #ec4899)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {username}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '1rem' }}>
          Just seized the <strong style={{ color: '#fbbf24' }}>#1 spot</strong> on the leaderboard!
        </p>

        {/* Score Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.2))',
          border: '1px solid rgba(251,191,36,0.4)',
          padding: '0.75rem 2rem', borderRadius: '50px',
          fontSize: '1.5rem', fontWeight: 900, color: '#fbbf24',
          marginBottom: '2rem',
          boxShadow: '0 0 20px rgba(251,191,36,0.2)',
        }}>
          🪙 {score.toLocaleString()} FanCoins
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleClose}
          style={{
            display: 'block', width: '100%',
            padding: '0.875rem', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #fbbf24, #f97316)',
            color: '#1a1a2e', fontWeight: 800, fontSize: '1rem',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🏆 Wear the Crown!
        </button>

        {/* Auto-dismiss bar */}
        <div style={{ marginTop: '1rem', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f97316)',
            animation: 'shrink 8s linear forwards', borderRadius: 3,
          }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>
          Auto-dismisses in 8s
        </p>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes crownFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes crownGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.7)); }
          50% { filter: drop-shadow(0 0 22px rgba(251,191,36,1)); }
        }
        @keyframes orbitStar {
          from { transform: rotate(var(--start)) translateX(60px) rotate(calc(-1 * var(--start))); }
          to { transform: rotate(calc(var(--start) + 360deg)) translateX(60px) rotate(calc(-1 * (var(--start) + 360deg))); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}

// ─── Crown Badge for Leaderboard Row ──────────────────────────────────────
export function CrownBadge() {
  return (
    <span style={{
      fontSize: '1.4rem',
      display: 'inline-block',
      animation: 'crownFloat 2s ease-in-out infinite',
      filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))',
    }}>
      👑
    </span>
  );
}
