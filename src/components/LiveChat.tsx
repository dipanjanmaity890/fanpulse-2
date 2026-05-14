'use client';

import React, { useState, useRef, useEffect } from 'react';
import { translateMessage } from '@/lib/gemini';

export function LiveChat({ username, onMessagesChange }: { username: string; onMessagesChange?: (msgs: string[]) => void }) {
  const [messages, setMessages] = useState<{id: number, user: string, text: string, translation?: string}[]>([
    { id: 1, user: 'CricketFan1', text: 'Kohli is on fire! 🔥' },
    { id: 2, user: 'AussieRules', text: 'Starc needs a wicket here.' },
    { id: 3, user: 'FanBoy2024', text: 'Predictions locked, let\'s go!' }
  ]);
  const [input, setInput] = useState('');
  const [translatingId, setTranslatingId] = useState<number | null>(null);
  const [langCode, setLangCode] = useState('Hindi'); // Default translation target
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const updated = [...messages, { id: Date.now(), user: username, text: input }];
    setMessages(updated);
    onMessagesChange?.(updated.map(m => m.text));
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTranslate = async (id: number, text: string) => {
    setTranslatingId(id);
    const translated = await translateMessage(text, langCode);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, translation: translated } : m));
    setTranslatingId(null);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>💬 Live Fan Chat</h3>
        <select 
          value={langCode} 
          onChange={e => setLangCode(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', outline: 'none' }}
        >
          <option value="Hindi">🌐 to Hindi</option>
          <option value="Bengali">🌐 to Bengali</option>
          <option value="Tamil">🌐 to Tamil</option>
          <option value="Telugu">🌐 to Telugu</option>
          <option value="English">🌐 to English</option>
        </select>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ background: msg.user === username ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', borderBottomLeftRadius: msg.user === username ? '12px' : '0', borderBottomRightRadius: msg.user === username ? '0' : '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: msg.user === username ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>{msg.user}</div>
              
              {/* Translate Button */}
              {msg.user !== username && !msg.translation && (
                <button 
                  onClick={() => handleTranslate(msg.id, msg.text)}
                  disabled={translatingId === msg.id}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                >
                  {translatingId === msg.id ? 'translating...' : 'Translate'}
                </button>
              )}
            </div>
            
            <div style={{ fontSize: '0.95rem' }}>{msg.text}</div>
            
            {/* Translated Output */}
            {msg.translation && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', gap: '0.25rem' }}>
                <span>🌐</span> {msg.translation}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cheer for your team..." 
          style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }}
        />
        <button type="submit" className="btn" style={{ padding: '0.75rem 1rem' }}>Send</button>
      </form>
    </div>
  );
}
