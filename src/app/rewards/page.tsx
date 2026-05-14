'use client';

import React from 'react';

const REWARDS = [
  { id: 1, name: 'Exclusive Match Avatar', cost: 500, icon: '👤', available: true },
  { id: 2, name: 'Streak Saver Token', cost: 1000, icon: '🛡️', available: true },
  { id: 3, name: 'VIP Prediction Lobby Access', cost: 2500, icon: '💎', available: true },
  { id: 4, name: 'Team Jersey (Digital)', cost: 5000, icon: '👕', available: false },
  { id: 5, name: 'Stadium Final Tickets Draw', cost: 10000, icon: '🎫', available: false },
];

export default function RewardsPage() {
  const currentCoins = 2450;

  return (
    <div className="container">
      <header className="header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Rewards Store</h1>
          <p style={{ color: 'var(--text-muted)' }}>Spend your FanCoins on exclusive perks</p>
        </div>
        <div className="user-profile">
          <div className="coins" style={{ padding: '0.75rem 1.5rem', fontSize: '1.25rem' }}>
            🪙 {currentCoins.toLocaleString()}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {REWARDS.map((reward) => (
          <div key={reward.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', opacity: reward.available ? 1 : 0.6 }}>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>{reward.icon}</div>
            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{reward.name}</h3>
            <div style={{ textAlign: 'center', color: 'var(--warning)', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              🪙 {reward.cost.toLocaleString()}
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              <button 
                className={`btn ${!reward.available || currentCoins < reward.cost ? 'btn-outline' : ''}`}
                style={{ width: '100%' }}
                disabled={!reward.available || currentCoins < reward.cost}
              >
                {!reward.available ? 'Sold Out' : (currentCoins >= reward.cost ? 'Redeem Now' : 'Not Enough Coins')}
              </button>
            </div>
            
            {currentCoins < reward.cost && reward.available && (
              <div className="progress-container" style={{ marginTop: '1rem' }}>
                <div className="progress-bar" style={{ width: `${(currentCoins / reward.cost) * 100}%` }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
