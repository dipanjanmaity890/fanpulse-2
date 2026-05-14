'use client';

import React, { useState } from 'react';
import { CrownBadge, FloatingCrown, CrownTakeoverPopup } from '@/components/CrownCelebration';
import { useAuth } from '@/context/AuthContext';

// ── Data ──────────────────────────────────────────────────────────────────
const GLOBAL_DATA = [
  { name: 'CricketGuru99',  points: 45200 },
  { name: 'SloggerKing',    points: 41100 },
  { name: 'PitchReader',    points: 39850 },
  { name: 'BoundaryHunter', points: 36200 },
  { name: 'SpinWizard',     points: 32000 },
  { name: 'FanBoy2024',     points: 28900 },
  { name: 'WicketWatcher',  points: 24500 },
  { name: 'Chasemaster',    points: 21000 },
];

const INITIAL_FRIENDS = [
  { name: 'Rahul_91',    points: 31400 },
  { name: 'PriyaCSK',   points: 27600 },
  { name: 'AkashMI',    points: 19800 },
];

const TIERS = [
  { name: 'Legend',        min: 40000, color: 'linear-gradient(90deg,#f59e0b,#ef4444)' },
  { name: 'International', min: 30000, color: 'linear-gradient(90deg,#6366f1,#a855f7)' },
  { name: 'State Level',   min: 20000, color: 'linear-gradient(90deg,#14b8a6,#0ea5e9)' },
  { name: 'Club Player',   min: 0,     color: 'rgba(255,255,255,0.15)' },
];

function getTier(points: number) {
  return TIERS.find(t => points >= t.min) || TIERS[TIERS.length - 1];
}

type Player = { name: string; points: number };

// ── Podium ────────────────────────────────────────────────────────────────
function Podium({ top3 }: { top3: (Player & { rank: number; isMe: boolean })[] }) {
  const order = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd · 1st · 3rd
  const heights = ['120px', '160px', '100px'];
  const medals = ['🥈', '👑', '🥉'];
  const rankLabels = ['#2', '#1', '#3'];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
      {order.map((p, i) => {
        const isFirst = i === 1;
        return (
          <div key={p.name} style={{
            flex: 1, maxWidth: 200, textAlign: 'center',
            background: isFirst
              ? 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(249,115,22,0.1))'
              : 'rgba(20,25,40,0.6)',
            border: `1px solid ${isFirst ? 'rgba(251,191,36,0.45)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '20px 20px 0 0',
            height: heights[i],
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            boxShadow: isFirst ? '0 0 40px rgba(251,191,36,0.2)' : 'none',
          }}>
            <div style={{ fontSize: isFirst ? '2.5rem' : '1.75rem', marginBottom: '0.25rem',
              animation: isFirst ? 'crownFloat 2s ease-in-out infinite' : 'none',
              filter: isFirst ? 'drop-shadow(0 0 10px rgba(251,191,36,0.8))' : 'none'
            }}>
              {medals[i]}
            </div>
            <div style={{ fontWeight: 800, fontSize: isFirst ? '1rem' : '0.875rem', color: isFirst ? '#fbbf24' : 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {p.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.25rem' }}>
              🪙 {p.points.toLocaleString()}
            </div>
            {p.isMe && <span style={{ marginTop: '0.25rem', fontSize: '0.7rem', background: 'rgba(99,102,241,0.3)', padding: '0.1rem 0.4rem', borderRadius: '20px', color: '#a5b4fc' }}>You</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Invite Modal ──────────────────────────────────────────────────────────
function InviteModal({ friends, onAdd, onClose }: {
  friends: Player[];
  onAdd: (name: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [added, setAdded] = useState<string[]>([]);

  const suggestions = ['Vikram_SRH', 'Meena_KKR', 'JoeDC', 'RajMI', 'Sita_CSK', 'Dev_RCB']
    .filter(s => !friends.find(f => f.name === s) && !added.includes(s));

  const handleAdd = (name: string) => {
    if (!name.trim()) return;
    setAdded(prev => [...prev, name]);
    onAdd(name);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 9001, width: '90%', maxWidth: 420,
        background: 'rgba(15,18,30,0.98)', border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: '24px', padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>👥 Add to Friends League</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {/* Username search */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (handleAdd(input), setInput(''))}
            placeholder="Enter FanPulse username…"
            style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.4)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
          />
          <button className="btn" style={{ padding: '0.75rem 1rem' }} onClick={() => { handleAdd(input); setInput(''); }}>
            Add
          </button>
        </div>

        {/* Quick-add suggestions */}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Quick Add:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => handleAdd(s)} style={{
              padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.3)',
              background: added.includes(s) ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.1)',
              color: added.includes(s) ? '#6ee7b7' : 'white', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
            }}>
              {added.includes(s) ? '✓ ' : '+ '}{s}
            </button>
          ))}
        </div>

        {/* Share invite link */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Share your league invite link:</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              fanpulse-live-match.web.app/join?league=FP-{Math.random().toString(36).slice(2,8).toUpperCase()}
            </div>
            <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} onClick={() => navigator.clipboard?.writeText('https://fanpulse-live-match.web.app')}>
              📋 Copy
            </button>
          </div>
        </div>

        {added.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', fontSize: '0.875rem', color: '#6ee7b7', textAlign: 'center' }}>
            ✅ Added {added.length} friend{added.length > 1 ? 's' : ''} to your league!
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { username } = useAuth();
  const me = username || 'You';

  const [activeTab, setActiveTab]   = useState<'global' | 'friends'>('global');
  const [crownPopup, setCrownPopup] = useState(false);
  const [userScore, setUserScore]   = useState(38500);
  const [globalData]                = useState(GLOBAL_DATA);
  const [friends, setFriends]       = useState<Player[]>(INITIAL_FRIENDS);
  const [isLeader, setIsLeader]     = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const prevLeader = globalData[0]?.name;

  // Build sorted boards
  const buildBoard = (base: Player[]) =>
    [...base, { name: me, points: userScore }]
      .sort((a, b) => b.points - a.points)
      .map((u, i) => ({ ...u, rank: i + 1, isMe: u.name === me }));

  const globalBoard  = buildBoard(globalData);
  const friendsBoard = buildBoard(friends);
  const activeBoard  = activeTab === 'global' ? globalBoard : friendsBoard;

  const userRank = activeBoard.findIndex(u => u.isMe) + 1;
  const gapToTop = activeBoard[0].points - userScore;

  const claimPoints = () => {
    const bonus = Math.floor(Math.random() * 2500) + 500;
    const newScore = userScore + bonus;
    setUserScore(newScore);

    const updated = buildBoard(activeTab === 'global' ? globalData : friends);
    if (updated[0].name === me && !isLeader) {
      setIsLeader(true);
      setCrownPopup(true);
    }
  };

  const addFriend = (name: string) => {
    if (friends.find(f => f.name === name)) return;
    const pts = Math.floor(Math.random() * 40000) + 5000;
    setFriends(prev => [...prev, { name, points: pts }]);
  };

  const top3 = activeBoard.slice(0, 3);
  const rest = activeBoard.slice(3);

  return (
    <div className="container">
      {crownPopup && (
        <CrownTakeoverPopup username={me} score={userScore} previousLeader={prevLeader} onClose={() => setCrownPopup(false)} />
      )}
      {showInvite && (
        <InviteModal friends={friends} onAdd={addFriend} onClose={() => setShowInvite(false)} />
      )}

      {/* Header */}
      <header className="header" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>🏆 Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLeader && activeBoard[0].isMe
              ? `👑 ${me}, you wear the crown!`
              : gapToTop > 0
              ? `You're #${userRank} — 🪙 ${gapToTop.toLocaleString()} away from the crown`
              : 'Keep playing to climb the ranks!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Score</div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fbbf24' }}>🪙 {userScore.toLocaleString()}</div>
          </div>
          <button onClick={claimPoints} className="btn" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)', color: '#1a1a2e', fontWeight: 800 }}>
            ⚡ Earn Bonus
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        {(['global', 'friends'] as const).map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? '' : 'btn-outline'}`} onClick={() => setActiveTab(tab)}>
            {tab === 'global' ? '🌍 Global Ranking' : `👥 Friends League (${friendsBoard.length})`}
          </button>
        ))}
        {activeTab === 'friends' && (
          <button
            onClick={() => setShowInvite(true)}
            style={{ marginLeft: 'auto', padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px dashed rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
          >
            + Invite Friends
          </button>
        )}
      </div>

      {/* Empty state for friends */}
      {activeTab === 'friends' && friendsBoard.length <= 1 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Your Friends League is Empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Invite friends to compete in a private leaderboard — only your circle can see it!
          </p>
          <button onClick={() => setShowInvite(true)} className="btn">
            + Add Your First Friend
          </button>
        </div>
      )}

      {/* Podium — only when 3+ players */}
      {activeBoard.length >= 3 && <Podium top3={top3 as (Player & { rank: number; isMe: boolean })[]} />}

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'friends' && friends.length > 0 && (
          <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>👥 Your private league — {friendsBoard.length} members</span>
            <button onClick={() => setShowInvite(true)} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>+ Invite more</button>
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border)' }}>
              {['Rank', 'Fan', 'Tier', 'Points'].map((h, i) => (
                <th key={h} style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: i === 3 ? 'right' : 'left', fontSize: '0.875rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeBoard.map(user => {
              const tier = getTier(user.points);
              return (
                <tr key={user.name + user.rank} style={{
                  borderBottom: '1px solid var(--border)',
                  background: user.isMe
                    ? (isLeader && user.rank === 1 ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.15)')
                    : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  {/* Rank */}
                  <td style={{ padding: '1.1rem 1.5rem', fontWeight: 800 }}>
                    {user.rank === 1 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CrownBadge /><span style={{ color: '#fbbf24' }}>#1</span>
                      </span>
                    ) : user.rank === 2 ? '🥈 #2' : user.rank === 3 ? '🥉 #3' : `#${user.rank}`}
                  </td>

                  {/* Name */}
                  <td style={{ padding: '1.1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                        background: user.isMe ? 'linear-gradient(135deg,#ec4899,#6366f1)' : 'rgba(255,255,255,0.1)',
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: user.isMe ? 800 : 400 }}>{user.name}</span>
                      {user.isMe && <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.3)', padding: '0.1rem 0.5rem', borderRadius: '20px', color: '#a5b4fc' }}>You</span>}
                      {user.rank === 1 && !user.isMe && <span style={{ fontSize: '0.75rem' }}>👑</span>}
                    </div>
                  </td>

                  {/* Tier */}
                  <td style={{ padding: '1.1rem 1.5rem' }}>
                    <span style={{ background: tier.color, padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: 'white' }}>
                      {tier.name}
                    </span>
                  </td>

                  {/* Points */}
                  <td style={{ padding: '1.1rem 1.5rem', textAlign: 'right', fontWeight: 800, color: '#fbbf24' }}>
                    🪙 {user.points.toLocaleString()}
                    {user.isMe && user.rank > 1 && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>
                        -{(activeBoard[0].points - user.points).toLocaleString()} to crown
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      {!isLeader && (
        <div className="glass-card" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
              🪙 {gapToTop > 0 ? gapToTop.toLocaleString() : '0'} FanCoins to seize the crown
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Keep predicting to climb the ranks!</p>
          </div>
          <button onClick={claimPoints} className="btn" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)', color: '#1a1a2e', fontWeight: 800, padding: '0.875rem 2rem' }}>
            ⚡ Claim Prediction Bonus
          </button>
        </div>
      )}
    </div>
  );
}
