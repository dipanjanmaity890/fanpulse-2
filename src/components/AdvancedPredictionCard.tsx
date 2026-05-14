'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OPTIONS = ['Dot Ball', 'Single/Double', 'Boundary (4 or 6)', 'Wicket'];

// ─── Hot Take AI reasoning ─────────────────────────────────────────────────
async function getAIHotTake(matchContext: string): Promise<{ pick: number; confidence: number; reason: string }> {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) return { pick: 2, confidence: 72, reason: "Batter looks aggressive — boundary likely." };

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are an expert IPL analyst. Given this match situation:
${matchContext}

Predict what will happen on the NEXT ball. Choose from ONLY these options:
0: Dot Ball
1: Single/Double
2: Boundary (4 or 6)
3: Wicket

Respond ONLY with valid JSON: {"pick": <0-3>, "confidence": <50-95>, "reason": "<one punchy sentence why, max 12 words>"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '');
    return JSON.parse(text);
  } catch {
    return { pick: 2, confidence: 68, reason: "Powerplay phase — boundary is the smart call." };
  }
}

// ─── Voice Prediction Hook ─────────────────────────────────────────────────
function useVoicePrediction(onResult: (optionIndex: number) => void) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<unknown>(null);

  const matchOption = (text: string): number => {
    const t = text.toLowerCase();
    if (t.includes('dot') || t.includes('no run')) return 0;
    if (t.includes('single') || t.includes('double') || t.includes('one') || t.includes('two')) return 1;
    if (t.includes('four') || t.includes('six') || t.includes('boundary') || t.includes('sixer')) return 2;
    if (t.includes('wicket') || t.includes('out') || t.includes('caught') || t.includes('bowl')) return 3;
    return -1;
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) { alert('Voice predictions need Chrome browser.'); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognitionAPI() as any;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript as string;
      setTranscript(spoken);
      const idx = matchOption(spoken);
      if (idx >= 0) onResult(idx);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    (recognitionRef.current as { stop: () => void } | null)?.stop();
    setListening(false);
  };

  return { listening, transcript, startListening, stopListening };
}

// ─── Upgraded Prediction Card ──────────────────────────────────────────────
export function AdvancedPredictionCard({
  onResult
}: {
  onResult?: (prediction: string, outcome: string, won: boolean) => void
}) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [hotTake, setHotTake] = useState<{ pick: number; confidence: number; reason: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [mode, setMode] = useState<'manual' | 'ai' | 'voice'>('manual');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const matchContext = "MI chasing 187, currently 163/7 after 15 overs. Need 24 off 30. Bumrah bowling. Hardik on strike (32 off 18).";

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0 || locked) return;
    const id = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, locked]);

  // Voice hook
  const { listening, startListening, stopListening } = useVoicePrediction((idx) => {
    setSelected(idx);
    setMode('manual');
  });

  // Voice transcript display
  useVoicePrediction((idx) => {
    setSelected(idx);
  });

  const handleAIHotTake = async () => {
    setLoadingAI(true);
    setMode('ai');
    const result = await getAIHotTake(matchContext);
    setHotTake(result);
    setSelected(result.pick);
    setLoadingAI(false);
  };

  const handleLock = () => {
    if (selected === null) return;
    setLocked(true);
    const outcome = OPTIONS[Math.floor(Math.random() * OPTIONS.length)];
    const won = outcome === OPTIONS[selected];
    onResult?.(OPTIONS[selected], outcome, won);
  };

  const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#6366f1';

  return (
    <div className="glass-card animate-slide-in" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glowing background pulse when listening */}
      {listening && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.08)', animation: 'pulse 1s infinite', pointerEvents: 'none', borderRadius: 'inherit' }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontWeight: 700 }}>⚡ Micro-Prediction</h3>
        <div className="live-badge"><span className="live-dot" />&nbsp;LIVE</div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        🎙️ {matchContext.slice(0, 60)}…
      </p>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['manual', 'ai', 'voice'] as const).map(m => (
          <button
            key={m}
            onClick={() => !locked && setMode(m)}
            style={{
              flex: 1, padding: '0.4rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem',
              fontWeight: mode === m ? 700 : 400, cursor: locked ? 'default' : 'pointer',
              background: mode === m ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
              color: mode === m ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            {m === 'manual' ? '✋ Manual' : m === 'ai' ? '🤖 Hot Take' : '🎤 Voice'}
          </button>
        ))}
      </div>

      {/* AI Hot Take Mode */}
      {mode === 'ai' && (
        <div style={{ marginBottom: '1rem' }}>
          {!hotTake && !loadingAI && (
            <button className="btn" onClick={handleAIHotTake} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              🤖 Let Gemini Predict for Me
            </button>
          )}
          {loadingAI && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', animation: 'pulse 1s infinite' }}>
              🧠 Gemini is analysing the match…
            </div>
          )}
          {hotTake && (
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: '#a5b4fc' }}>AI Pick: {OPTIONS[hotTake.pick]}</span>
                <span style={{ background: 'rgba(99,102,241,0.3)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                  {hotTake.confidence}% confident
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                "{hotTake.reason}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Voice Mode */}
      {mode === 'voice' && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <button
            onClick={listening ? stopListening : startListening}
            style={{
              width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: listening ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)',
              boxShadow: listening ? '0 0 20px rgba(239,68,68,0.5)' : '0 0 20px rgba(99,102,241,0.3)',
              fontSize: '1.75rem', transition: 'all 0.2s',
              animation: listening ? 'pulse 1s infinite' : 'none'
            }}
          >
            {listening ? '⏹️' : '🎤'}
          </button>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {listening ? 'Listening… say "boundary" or "wicket"' : 'Tap to speak your prediction'}
          </p>
          {voiceTranscript && (
            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
              Heard: "{voiceTranscript}"
            </p>
          )}
        </div>
      )}

      {/* Option Buttons (always visible for manual / confirmation) */}
      <div style={{ marginBottom: '1rem' }}>
        {OPTIONS.map((option, idx) => (
          <button
            key={idx}
            onClick={() => { if (!locked && mode === 'manual') setSelected(idx); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '0.6rem 1rem', marginBottom: '0.4rem', borderRadius: '10px', border: 'none',
              cursor: locked || mode !== 'manual' ? 'default' : 'pointer',
              background: selected === idx
                ? (mode === 'ai' ? 'rgba(124,58,237,0.3)' : 'rgba(99,102,241,0.3)')
                : 'rgba(255,255,255,0.05)',
              color: selected === idx ? 'white' : 'var(--text-muted)',
              fontWeight: selected === idx ? 700 : 400, fontSize: '0.9rem',
              transition: 'all 0.15s',
              outline: selected === idx ? '1px solid rgba(99,102,241,0.5)' : 'none'
            }}
          >
            {selected === idx && (mode === 'ai' ? '🤖 ' : mode === 'voice' ? '🎤 ' : '✓ ')}{option}
          </button>
        ))}
      </div>

      {/* Footer: timer + lock button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.875rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: timerColor, fontFamily: 'monospace' }}>
          ⏳ 00:{timeLeft.toString().padStart(2, '0')}
        </div>
        <button
          className="btn"
          onClick={handleLock}
          disabled={selected === null || timeLeft === 0 || locked}
          style={{
            opacity: (selected === null || timeLeft === 0 || locked) ? 0.5 : 1,
            background: locked ? 'rgba(16,185,129,0.3)' : undefined
          }}
        >
          {locked ? '✅ Locked In!' : timeLeft === 0 ? '🔒 Expired' : 'Lock Prediction'}
        </button>
      </div>
    </div>
  );
}
