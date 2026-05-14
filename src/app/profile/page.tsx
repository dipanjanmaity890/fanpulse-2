'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// ── Dummy Data (would come from Firebase in production) ──────────────
const USER_STATS = {
  rank: 4,
  points: 38500,
  tier: 'International',
  predictionsMade: 142,
  predictionsWon: 98,
  bestStreak: 7,
  avgAccuracy: 69,
};

const BADGES = [
  { id: 'oracle', name: 'Oracle', desc: '5 correct predictions in a row', icon: '🔮', earnedAt: 'May 10, 2026', color: '#8b5cf6' },
  { id: 'hunter', name: 'Boundary Hunter', desc: 'Predicted 10 boundaries', icon: '🌊', earnedAt: 'May 12, 2026', color: '#06b6d4' },
  { id: 'contrarian', name: 'Contrarian King', desc: 'Beat the crowd 5 times', icon: '🦁', earnedAt: null, color: '#f59e0b' },
  { id: 'sharpshooter', name: 'Sharpshooter', desc: '80%+ accuracy in a match', icon: '🎯', earnedAt: 'May 13, 2026', color: '#ef4444' },
  { id: 'loyalist', name: 'Super Fan', desc: 'Voted in 50 matches', icon: '🏏', earnedAt: null, color: '#10b981' },
];

export default function ProfilePage() {
  const { user, username, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'badges'>('stats');

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '2rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Please sign in to view your profile</h2>
        <a href="/" className="btn" style={{ display: 'inline-block', marginTop: '1rem' }}>Go Home</a>
      </div>
    );
  }

  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      
      {/* ── Profile Header Card ── */}
      <div className="glass-card" style={{ 
        position: 'relative', overflow: 'hidden', padding: '3rem 2rem', marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(30, 35, 55, 0.8), rgba(99, 102, 241, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        {/* Abstract glow */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.2, borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 800, border: '4px solid rgba(255,255,255,0.2)',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
          }}>
            {avatarLetter}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {username}
              <span style={{ fontSize: '1rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '0.25rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                {USER_STATS.tier}
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
              Member since May 2026 • {user.email}
            </p>
          </div>
          
          <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Global Rank</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fbbf24' }}>#{USER_STATS.rank}</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'stats' ? '' : 'btn-outline'}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Performance Stats
        </button>
        <button 
          className={`btn ${activeTab === 'badges' ? '' : 'btn-outline'}`}
          onClick={() => setActiveTab('badges')}
        >
          🎖️ Badge Wall
        </button>
      </div>

      {/* ── Stats Tab ── */}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.5rem' }}>
              {USER_STATS.points.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total FanCoins 🪙</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', marginBottom: '0.5rem' }}>
              {USER_STATS.avgAccuracy}%
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Prediction Accuracy 🎯</div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
              <div style={{ width: `${USER_STATS.avgAccuracy}%`, height: '100%', background: '#10b981' }} />
            </div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ec4899', marginBottom: '0.5rem' }}>
              {USER_STATS.bestStreak}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Best Win Streak 🔥</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6366f1', marginBottom: '0.5rem' }}>
              {USER_STATS.predictionsWon} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {USER_STATS.predictionsMade}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Predictions Won ✅</div>
          </div>

        </div>
      )}

      {/* ── Badge Wall Tab ── */}
      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {BADGES.map(b => {
            const unlocked = !!b.earnedAt;
            return (
              <div key={b.id} className="glass-card" style={{ 
                position: 'relative', overflow: 'hidden',
                borderColor: unlocked ? `${b.color}50` : 'rgba(255,255,255,0.05)',
                background: unlocked ? `linear-gradient(135deg, rgba(20,25,40,0.8), ${b.color}15)` : 'rgba(20,25,40,0.4)',
                opacity: unlocked ? 1 : 0.6,
                transition: 'all 0.3s'
              }}>
                {unlocked && (
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, background: b.color, filter: 'blur(40px)', opacity: 0.3, borderRadius: '50%' }} />
                )}
                
                <div style={{ 
                  width: 60, height: 60, borderRadius: '16px', marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                  background: unlocked ? `${b.color}20` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${unlocked ? b.color : 'rgba(255,255,255,0.1)'}`,
                  filter: unlocked ? `drop-shadow(0 0 10px ${b.color}60)` : 'grayscale(100%)'
                }}>
                  {b.icon}
                </div>
                
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: unlocked ? 'white' : 'var(--text-muted)' }}>{b.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '40px' }}>{b.desc}</p>
                
                {unlocked ? (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: b.color, background: `${b.color}15`, display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
                    Unlocked {b.earnedAt}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    🔒 Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
