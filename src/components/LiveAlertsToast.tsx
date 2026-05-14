'use client';

import { useState, useEffect } from 'react';

interface Alert {
  id: number;
  title: string;
  message: string;
  icon: string;
  color: string;
}

const DEMO_ALERTS = [
  { title: "Match Starting!", message: "MI vs CSK is starting in 10 minutes. Lock your Oracle predictions now.", icon: "⏳", color: "#6366f1" },
  { title: "WICKET! 🚨", message: "Bumrah strikes! A new prediction window has opened.", icon: "🎯", color: "#ef4444" },
  { title: "Leaderboard Update", message: "You just overtook 'CricketFan1' and moved to #3 globally! 👑", icon: "🏆", color: "#f59e0b" },
];

export function LiveAlertsToast() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Simulate incoming push notifications over time
    let currentIndex = 0;
    
    const triggerNextAlert = () => {
      if (currentIndex >= DEMO_ALERTS.length) return;
      
      const newAlert = {
        id: Date.now(),
        ...DEMO_ALERTS[currentIndex]
      };
      
      setAlerts(prev => [...prev, newAlert]);
      
      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
      }, 6000);
      
      currentIndex++;
      setTimeout(triggerNextAlert, Math.random() * 30000 + 20000); // Trigger next alert between 20s and 50s
    };

    const timer = setTimeout(triggerNextAlert, 10000); // First alert after 10s
    
    return () => clearTimeout(timer);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {alerts.map(alert => (
        <div key={alert.id} style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderLeft: `4px solid ${alert.color}`,
          borderRadius: '8px',
          padding: '16px',
          width: '320px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          gap: '12px',
          animation: 'slideInRight 0.3s ease-out forwards',
        }}>
          <div style={{ fontSize: '1.5rem' }}>{alert.icon}</div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '0.95rem' }}>{alert.title}</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>{alert.message}</p>
          </div>
          <button 
            onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'flex-start', padding: 0 }}
          >
            ✕
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
