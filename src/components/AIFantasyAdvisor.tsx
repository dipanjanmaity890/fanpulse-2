'use client';

import { useState, useEffect } from 'react';
import { getFantasyAdvice } from '@/lib/gemini';
import { IPLMatchState } from '@/lib/cricapi';

export function AIFantasyAdvisor({ match }: { match: IPLMatchState | null }) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!match) return;
    setLoading(true);
    getFantasyAdvice(`${match.teamA} vs ${match.teamB}`).then(res => {
      setAdvice(res);
      setLoading(false);
    });
  }, [match]);

  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.9), rgba(16, 185, 129, 0.15))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: -30, left: -30, width: 100, height: 100, background: '#10b981', filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%', pointerEvents: 'none' }} />

      <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🤖 Fantasy AI Advisor
      </h3>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', animation: 'pulse 1s infinite' }}>
          🧠 Analyzing pitch data & recent form...
        </p>
      ) : advice ? (
        <div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.95rem', lineHeight: 1.6, color: '#e2e8f0' }}>
            {advice}
          </div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.5)', color: '#10b981' }}>
            Update My Dream11 Team
          </button>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Waiting for match data...
        </p>
      )}
    </div>
  );
}
