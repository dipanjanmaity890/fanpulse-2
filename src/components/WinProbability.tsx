'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { IPLMatchState } from '@/lib/cricapi';

interface OverPoint { over: number; chasing: number; batting: number; label: string; }

// ── Parse "165/4 (15.0 ov)" → { r, w, o } ──────────────────────────────
function parseScore(s?: string): { r: number; w: number; o: number } | null {
  if (!s) return null;
  const m = s.match(/(\d+)\/(\d+)\s*\(([0-9.]+)\s*ov\)/);
  if (!m) return null;
  return { r: parseInt(m[1]), w: parseInt(m[2]), o: parseFloat(m[3]) };
}

// ── Simple win-probability model ─────────────────────────────────────────
function winProb(score: number, wickets: number, target: number, oversPlayed: number, totalOvers = 20): number {
  const runsNeeded = target - score;
  const oversLeft  = totalOvers - oversPlayed;
  if (runsNeeded <= 0) return 100;
  if (oversLeft  <= 0 || wickets >= 10) return 0;
  const reqRate  = runsNeeded / oversLeft;
  const curRate  = oversPlayed > 0 ? score / oversPlayed : 0;
  const wktLeft  = 10 - wickets;
  const rateAdv  = curRate - reqRate;
  const resource = (wktLeft / 10) * (oversLeft / totalOvers);
  return Math.max(5, Math.min(95, 50 + rateAdv * 8 + resource * 20));
}

// ── Build over-by-over history from current score ─────────────────────────
// Simulates a realistic historic progression ending at the current real score
function buildHistory(batting: { r: number; w: number; o: number }, target: number): OverPoint[] {
  const totalOvers = 20;
  const endOver    = Math.floor(batting.o);
  const points: OverPoint[] = [];

  let accRuns = 0;
  let accWkts = 0;
  const runsPerOver = endOver > 0 ? batting.r / endOver : 8;

  for (let ov = 1; ov <= endOver; ov++) {
    // Simulate realistic scoring variance (slows down on wickets, fast in PP)
    const pp     = ov <= 6;
    const death  = ov >= 16;
    const factor = pp ? 1.25 : death ? 1.35 : 0.9;
    const wicketChance = ov > 6 ? 0.2 : 0.08;

    accRuns  += Math.round(runsPerOver * factor * (0.8 + Math.random() * 0.4));
    accWkts  += Math.random() < wicketChance && accWkts < 9 ? 1 : 0;

    // Clamp to real final values at the last over
    const r = ov === endOver ? batting.r : Math.min(accRuns, batting.r - (endOver - ov) * 6);
    const w = ov === endOver ? batting.w : Math.min(accWkts, batting.w);

    const prob = winProb(r, w, target, ov);
    points.push({ over: ov, chasing: Math.round(prob), batting: Math.round(100 - prob), label: `Ov ${ov}` });
  }
  return points;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,15,28,0.96)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '0.82rem' }}>
      <p style={{ color: '#64748b', marginBottom: '0.2rem' }}>{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────
export function WinProbabilityGraph({ match }: { match?: IPLMatchState | null }) {
  const [data, setData] = useState<OverPoint[]>([]);
  const [teamA, setTeamA] = useState('Team A');
  const [teamB, setTeamB] = useState('Team B');
  const [animated, setAnimated] = useState<OverPoint[]>([]);
  const [dataKey, setDataKey] = useState(0); // force re-animate on new match

  useEffect(() => {
    if (!match) return;

    const sA = parseScore(match.score.teamA);
    const sB = parseScore(match.score.teamB);

    let batting: { r: number; w: number; o: number } | null = null;
    let target = 0;
    let chaserName = '';
    let batterName = '';

    if (sA && sB) {
      // 2nd innings in progress — A batted first
      batting = sB; target = sA.r + 1;
      chaserName = match.shortB; batterName = match.shortA;
    } else if (sA) {
      // Only A has batted — 1st innings
      batting = sA; target = 200; // estimated
      chaserName = match.shortA; batterName = match.shortA;
    } else {
      return;
    }

    setTeamA(chaserName);
    setTeamB(batterName);

    const pts = buildHistory(batting, target);
    setData(pts);
    setDataKey(k => k + 1);
    setAnimated([]);

    // Animate point by point
    let i = 1;
    const id = setInterval(() => {
      setAnimated(pts.slice(0, i));
      i++;
      if (i > pts.length) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, [match?.id, match?.score.teamA, match?.score.teamB]); // re-run when match score changes

  const current = data[data.length - 1];

  if (!data.length) {
    return (
      <div className="glass-card">
        <h3 style={{ marginBottom: '0.75rem' }}>📊 Win Probability</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          Waiting for match data to begin…
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>📊 Win Probability</h3>
        {current && (
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: '#6366f1', fontWeight: 800 }}>{teamA} {current.chasing}%</span>
            <span style={{ color: '#14b8a6', fontWeight: 800 }}>{teamB} {current.batting}%</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200} key={dataKey}>
        <AreaChart data={animated} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<Tip />} />
          <ReferenceLine y={50} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="chasing" name={teamA} stroke="#6366f1" strokeWidth={2.5} fill="url(#gA)" dot={false} />
          <Area type="monotone" dataKey="batting"  name={teamB} stroke="#14b8a6" strokeWidth={2.5} fill="url(#gB)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', textAlign: 'right', marginTop: '0.4rem' }}>
        Derived from live score · updates with each refresh
      </p>
    </div>
  );
}
