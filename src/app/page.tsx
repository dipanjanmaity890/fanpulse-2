'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LiveScoreboard, ClockBar } from '@/components/LiveScoreboard';
import { AICommentatorPanel, FanMoodMeter } from '@/components/AICommentator';
import { CrowdOracle, PostMatchStory } from '@/components/CrowdOracle';
import { generatePostMatchStory } from '@/lib/gemini';
import { WinProbabilityGraph } from '@/components/WinProbability';
import { AdvancedPredictionCard } from '@/components/AdvancedPredictionCard';
import { FanPulseReactions } from '@/components/FanPulseReactions';
import { IPLMatchState } from '@/lib/cricapi';
import { LiveChat } from '@/components/LiveChat';
import { AIFantasyAdvisor } from '@/components/AIFantasyAdvisor';
import { MatchScheduleWidget } from '@/components/MatchScheduleWidget';

function StreaksPanel() {
  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>🔥 Current Streak</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
        <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: 1 }}>3</div>
        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', paddingBottom: '0.5rem' }}>Winning Predictions</div>
      </div>
      <div className="progress-container"><div className="progress-bar" style={{ width: '60%' }}></div></div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'right' }}>2 more for a 2x Multiplier!</p>
    </div>
  );
}

function AIQuestPanel() {
  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: 'var(--accent)', filter: 'blur(50px)', opacity: 0.3, borderRadius: '50%' }}></div>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🤖 AI Daily Quest</h3>
      <div style={{ background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>The Boundary Hunter</h4>
        <p style={{ fontSize: '0.95rem' }}>Correctly predict 2 boundaries during the Powerplay today.</p>
      </div>
      <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--accent)', color: 'var(--accent)' }}>Claim Reward: 150 🪙</button>
    </div>
  );
}

// --- Login Screen ---
function LoginScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏏</div>
      <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>FanPulse 2.0</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '3rem', lineHeight: 1.6 }}>
        The ultimate gamified cricket engagement platform. Predict, compete, and win during every live match!
      </p>

      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Get Started</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Sign in to track your streaks, earn FanCoins, and climb the leaderboard.</p>

        <button
          onClick={onSignIn}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: '0.875rem 1.5rem', borderRadius: '12px', background: 'white', color: '#1f2937', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
          onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

// --- Main Dashboard ---
export default function GamificationDashboard() {
  const { user, username, loading, signInWithGoogle, logout } = useAuth();
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Kohli is on fire! 🔥', 'Starc needs a wicket here.', "Predictions locked, let's go!"
  ]);
  const [lastPrediction, setLastPrediction] = useState<{ prediction: string; outcome: string; won: boolean } | undefined>();
  const [liveMatch, setLiveMatch] = useState<IPLMatchState | null>(null);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen onSignIn={signInWithGoogle} />;

  const avatarLetter = username.charAt(0).toUpperCase();

  const handlePredictionResult = (prediction: string, outcome: string, won: boolean) => {
    setLastPrediction({ prediction, outcome, won });
  };

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>FanPulse 2.0</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, <strong style={{ color: 'white' }}>{username}</strong>!</p>
        </div>
        <div className="user-profile" style={{ gap: '1rem' }}>
          <div className="coins">🪙 2,450</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar" title={user.email ?? ''}>{avatarLetter}</div>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Match Schedule Strip */}
      <MatchScheduleWidget />

      {/* Full layout: 3 columns on large screens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>

        {/* Left Column — Match + Predictions + AI features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ClockBar />
          <LiveScoreboard onMatchLoad={setLiveMatch} />
          <WinProbabilityGraph match={liveMatch} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <AdvancedPredictionCard onResult={handlePredictionResult} />
            <LiveChat username={username} onMessagesChange={setChatMessages} />
          </div>

          <CrowdOracle />
          <AICommentatorPanel username={username} lastPrediction={lastPrediction} />
        </div>

        {/* Right Column — Gamification Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <StreaksPanel />

          {/* Tier 1: Fantasy AI Advisor */}
          <AIFantasyAdvisor match={liveMatch} />

          {/* Tier 1: Fan Mood Meter */}
          <FanMoodMeter messages={chatMessages} />

          <AIQuestPanel />

          {/* Tier 1: Post-Match Story */}
          <PostMatchStory
            username={username}
            onGenerate={() => generatePostMatchStory(username, {
              totalPredictions: 10,
              correctPredictions: 7,
              finalStreak: 5,
              rank: 4,
              fansCoinsEarned: 850,
              matchName: "MI vs CSK — IPL 2026",
              badges: ["Oracle", "Boundary Hunter"]
            })}
          />

          {/* ⚡ Fan Pulse Reactions — fills the bottom-right gap */}
          <FanPulseReactions />

          <div className="glass-card">
            <h4 style={{ marginBottom: '1rem' }}>🔮 Pre-Match Oracle</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Who will be the Player of the Match?</p>
            {liveMatch ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[liveMatch.teamA.split(' ').slice(-1)[0], liveMatch.teamB.split(' ').slice(-1)[0] + ' Captain', 'Dark Horse Pick'].map((p, i) => (
                  <button key={i} className="btn btn-outline" style={{ textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.875rem', opacity: i === 0 ? 1 : 0.6 }}>
                    {i === 0 ? '🏏' : i === 1 ? '⚡' : '🌟'} {p}
                  </button>
                ))}
              </div>
            ) : (
              <button className="btn btn-outline" style={{ width: '100%', opacity: 0.5 }}>Locked (Match Started)</button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

