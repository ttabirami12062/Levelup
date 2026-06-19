'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();

  // "signin" or "signup" — which mode the screen is in
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    // simple checks before we even call Supabase
    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      // create a brand-new parent account
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      // sign in to an existing parent account
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    // success — send them to the profile picker (we build this next)
    router.push('/profiles');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #5BB8F5 0%, #C9EEFF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'var(--font-ui)',
        overflow: 'hidden',
      }}
    >
      {/* floating clouds for atmosphere */}
      <Cloud style={{ top: '10%', left: '8%' }} scale={1} />
      <Cloud style={{ top: '22%', left: '18%' }} scale={0.65} />
      <Cloud style={{ top: '12%', right: '10%' }} scale={1.15} />
      <Cloud style={{ top: '30%', right: '20%' }} scale={0.7} />
      <Cloud style={{ bottom: '12%', left: '12%' }} scale={0.85} />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          background: '#fff',
          borderRadius: 28,
          padding: '32px 26px',
          border: '4px solid #7B6FE8',
          boxShadow: '0 8px 0 #5a4fc4, 0 14px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* lock badge */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#7B6FE8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #5a4fc4',
              boxShadow: '0 4px 0 #5a4fc4',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="10" width="16" height="11" rx="3" fill="#F5C842" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="15" r="1.8" fill="#7B6FE8" />
            </svg>
          </div>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-game)',
            fontSize: 26,
            color: '#3a3a55',
            textAlign: 'center',
            margin: '0 0 4px',
          }}
        >
          {mode === 'signup' ? 'Grown-up sign up' : 'Welcome back!'}
        </h1>
        <p style={{ textAlign: 'center', color: '#7a7a90', fontSize: 14, margin: '0 0 22px' }}>
          {mode === 'signup' ? "Keeps your kid's progress safe" : 'Sign in to keep playing'}
        </p>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5a5a70', marginBottom: 6 }}>
          Parent email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5a5a70', margin: '14px 0 6px' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          style={inputStyle}
        />

        {error && (
          <p style={{ color: '#E85454', fontSize: 13, fontWeight: 700, margin: '14px 0 0', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            marginTop: 22,
            background: loading ? '#f0d98a' : '#F5C842',
            border: 'none',
            color: '#5a4500',
            fontFamily: 'var(--font-game)',
            fontSize: 19,
            padding: '14px',
            borderRadius: 16,
            cursor: loading ? 'default' : 'pointer',
            boxShadow: '0 5px 0 #c99e1f',
          }}
        >
          {loading ? 'One sec…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#7a7a90', margin: '18px 0 0' }}>
          {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
          <span
            onClick={() => {
              setError('');
              setMode(mode === 'signup' ? 'signin' : 'signup');
            }}
            style={{ color: '#7B6FE8', fontWeight: 800, cursor: 'pointer' }}
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  fontSize: 15,
  fontFamily: 'var(--font-ui)',
  border: '3px solid #d8d8e8',
  borderRadius: 14,
  outline: 'none',
  color: '#3a3a55',
};

function Cloud({ style, scale = 1 }: { style: React.CSSProperties; scale?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: 120 * scale,
        height: 50 * scale,
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 120 50" fill="none">
        <ellipse cx="35" cy="34" rx="28" ry="16" fill="#fff" />
        <ellipse cx="60" cy="26" rx="26" ry="20" fill="#fff" />
        <ellipse cx="85" cy="34" rx="26" ry="16" fill="#fff" />
        <rect x="20" y="34" width="82" height="14" rx="7" fill="#fff" />
      </svg>
    </div>
  );
}