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
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleGoogle() {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profiles`,
      },
    });
    // if signInWithOAuth returns, something went wrong (success = redirect away)
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  function switchMode(next: 'signin' | 'signup') {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
    setPassword2('');
  }

  // The two modes get different colors and icons so they're easy to tell apart.
  const theme = mode === 'signup'
    ? { main: '#5DBE4A', dark: '#3D9E2A', button: '#5DBE4A', buttonShadow: '#3D9E2A', buttonText: '#FFFFFF' }
    : { main: '#7B6FE8', dark: '#5a4fc4', button: '#F5C842', buttonShadow: '#c99e1f', buttonText: '#5a4500' };

  async function handleSubmit() {
    setError('');
    setNotice('');

    // simple checks before we even call Supabase
    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    // New accounts must meet every rule; sign-in only checks length so older
    // passwords made before these rules still work.
    if (mode === 'signup' && !PASSWORD_RULES.every((r) => r.test(password))) {
      setError('Your password needs to tick every box below.');
      return;
    }
    if (mode === 'signup' && password !== password2) {
      setError("The two passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      // create a brand-new parent account
      // The confirm link in the email brings the parent straight back to the player picker.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/profiles` },
      });
      if (error) {
        setError(friendlyAuthError(error.message));
        setLoading(false);
        return;
      }
      // For an email that's already registered, Supabase pretends it worked but
      // returns a user with no identities, so point them to sign in instead.
      if (data.user && data.user.identities?.length === 0) {
        switchMode('signin');
        setNotice('This email already has an account. Sign in below!');
        setLoading(false);
        return;
      }
      // Supabase holds back the session until the email link is clicked.
      if (!data.session) {
        setMode('signin');
        setNotice('Check your email and tap the link to confirm, then sign in here.');
        setLoading(false);
        return;
      }
    } else {
      // sign in to an existing parent account
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(friendlyAuthError(error.message));
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
          border: `4px solid ${theme.main}`,
          boxShadow: `0 8px 0 ${theme.dark}, 0 14px 24px rgba(0,0,0,0.18)`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* sign in / create account tabs */}
        <div style={{ display: 'flex', background: '#F0F0F8', borderRadius: 16, padding: 4, marginBottom: 20 }}>
          {(['signin', 'signup'] as const).map((m) => {
            const active = mode === m;
            const color = m === 'signup' ? '#5DBE4A' : '#7B6FE8';
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  flex: 1, border: 'none', borderRadius: 12, padding: '10px 6px', cursor: 'pointer',
                  fontFamily: 'var(--font-game)', fontSize: 15,
                  background: active ? color : 'transparent', color: active ? 'white' : '#8A8AA5',
                  boxShadow: active ? '0 3px 0 rgba(0,0,0,0.15)' : 'none', transition: 'all 0.15s',
                }}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            );
          })}
        </div>

        {/* badge */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div
            style={{
              width: 68, height: 68, borderRadius: '50%', background: theme.main,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: `4px solid ${theme.dark}`, boxShadow: `0 4px 0 ${theme.dark}`,
            }}
          >
            {mode === 'signup' ? (
              // a little family: one grown-up, two kids
              <svg width="38" height="32" viewBox="0 0 38 32">
                <circle cx="19" cy="7" r="5" fill="#FFE066" />
                <path d="M11 30 Q11 15 19 15 Q27 15 27 30 Z" fill="white" />
                <circle cx="6.5" cy="14" r="3.8" fill="#FFE066" />
                <path d="M1 30 Q1 20 6.5 20 Q12 20 12 30 Z" fill="#FFB3C6" />
                <circle cx="31.5" cy="14" r="3.8" fill="#FFE066" />
                <path d="M26 30 Q26 20 31.5 20 Q37 20 37 30 Z" fill="#C4AEFF" />
              </svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="10" width="16" height="11" rx="3" fill="#F5C842" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="15" r="1.8" fill="#7B6FE8" />
              </svg>
            )}
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
          {mode === 'signup' ? 'Create a family account' : 'Welcome back!'}
        </h1>
        <p style={{ textAlign: 'center', color: '#7a7a90', fontSize: 14, margin: '0 0 22px' }}>
          {mode === 'signup' ? 'One grown-up account for all your kids' : "Sign in to see your kids' progress"}
        </p>

        {/* Continue with Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: '#fff',
            border: '3px solid #d8d8e8',
            color: '#3a3a55',
            fontFamily: 'var(--font-ui)',
            fontSize: 15,
            fontWeight: 700,
            padding: '12px',
            borderRadius: 14,
            cursor: loading ? 'default' : 'pointer',
            boxShadow: '0 4px 0 #d8d8e8',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
        </button>

        {/* or divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 2, background: '#ececf4' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#a8a8bc' }}>or</span>
          <div style={{ flex: 1, height: 2, background: '#ececf4' }} />
        </div>

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
          placeholder={mode === 'signup' ? 'e.g. sunnyDay24' : 'Your password'}
          style={inputStyle}
        />

        {mode === 'signup' && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: ok ? '#3D9E2A' : '#9a9ab0', transition: 'color 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="7" fill={ok ? '#5DBE4A' : '#ECECF4'} />
                    {ok && <path d="M4.5 8.2 L7 10.5 L11.5 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                  </svg>
                  {rule.label}
                </div>
              );
            })}
          </div>
        )}

        {mode === 'signup' && (
          <>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5a5a70', margin: '14px 0 6px' }}>
              Type your password again
            </label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Same password as above"
              style={{ ...inputStyle, borderColor: password2 && password2 !== password ? '#E85454' : password2 ? '#5DBE4A' : '#d8d8e8' }}
            />
            <p style={{ fontSize: 12, color: '#9a9ab0', margin: '10px 0 0', textAlign: 'center' }}>
              We&apos;ll send a link to your email to make sure it&apos;s really you.
            </p>
          </>
        )}

        {notice && (
          <p style={{ color: '#3D9E2A', fontSize: 13, fontWeight: 700, margin: '14px 0 0', textAlign: 'center' }}>
            {notice}
          </p>
        )}

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
            background: theme.button,
            opacity: loading ? 0.7 : 1,
            border: 'none',
            color: theme.buttonText,
            fontFamily: 'var(--font-game)',
            fontSize: 19,
            padding: '14px',
            borderRadius: 16,
            cursor: loading ? 'default' : 'pointer',
            boxShadow: `0 5px 0 ${theme.buttonShadow}`,
          }}
        >
          {loading ? 'One sec…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#7a7a90', margin: '18px 0 0' }}>
          {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
          <span
            onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
            style={{ color: mode === 'signup' ? '#7B6FE8' : '#3D9E2A', fontWeight: 800, cursor: 'pointer' }}
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </span>
        </p>
      </div>
    </div>
  );
}

// Supabase's raw errors can be blank ("{}") or technical, so translate the common ones.
function friendlyAuthError(message: string): string {
  const m = (message || '').toLowerCase();
  if (!m || m === '{}' || m.includes('sending confirmation email')) {
    return "We couldn't send the confirmation email right now. Please try again in a few minutes.";
  }
  if (m.includes('email not confirmed')) return 'Please tap the link in your confirmation email first, then sign in.';
  if (m.includes('invalid login credentials')) return "That email and password don't match. Try again?";
  if (m.includes('already registered')) return 'This email already has an account. Tap Sign in below.';
  if (m.includes('rate limit')) return 'Too many tries. Please wait a few minutes and try again.';
  return message;
}

// Shown as a live checklist under the password box when creating an account.
const PASSWORD_RULES = [
  { label: 'At least 6 characters',      test: (p: string) => p.length >= 6 },
  { label: 'Has at least one capital letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Has at least one number',    test: (p: string) => /\d/.test(p) },
];

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