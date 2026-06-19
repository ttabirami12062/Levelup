'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AVATARS } from '@/components/avatar/Avatars';

export default function AddProfilePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState<number>(1); // default to first avatar
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // session check in progress
  const [error, setError] = useState('');

  // On load: make sure a parent is logged in. No session → back to login.
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      setChecking(false);
    }
    checkSession();
  }, [router]);

  async function handleSave() {
    setError('');

    if (name.trim().length === 0) {
      setError('Please enter a name.');
      return;
    }

    setLoading(true);

    // grab the logged-in parent's id — the RLS policy requires
    // parent_id to equal auth.uid(), so we pass it explicitly.
  const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      router.replace('/login');
      return;
    }

    const { error } = await supabase.from('profiles').insert({
      parent_id: user.id,
      name: name.trim(),
      avatar: avatarId,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // new kid created — back to the picker, where they'll now show up
    router.push('/profiles');
  }

  // while we confirm the session, show nothing (avoids a flash of the form)
  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #5BB8F5 0%, #C9EEFF 100%)',
        }}
      />
    );
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
      <Cloud style={{ top: '24%', right: '10%' }} scale={1.1} />
      <Cloud style={{ bottom: '12%', left: '14%' }} scale={0.8} />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 28,
          padding: '30px 26px',
          border: '4px solid #7B6FE8',
          boxShadow: '0 8px 0 #5a4fc4, 0 14px 24px rgba(0,0,0,0.18)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-game)',
            fontSize: 26,
            color: '#3a3a55',
            textAlign: 'center',
            margin: '0 0 4px',
          }}
        >
          Add a Player
        </h1>
        <p style={{ textAlign: 'center', color: '#7a7a90', fontSize: 14, margin: '0 0 22px' }}>
          Pick a name and a character
        </p>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5a5a70', marginBottom: 6 }}>
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Maya"
          maxLength={16}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 14px',
            fontSize: 15,
            fontFamily: 'var(--font-ui)',
            border: '3px solid #d8d8e8',
            borderRadius: 14,
            outline: 'none',
            color: '#3a3a55',
          }}
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5a5a70', margin: '20px 0 10px' }}>
          Choose a character
        </label>

        {/* single-row avatar picker */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}
        >
          {AVATARS.map((a) => {
            const selected = a.id === avatarId;
            const Char = a.component;
            return (
              <button
                key={a.id}
                onClick={() => setAvatarId(a.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 8px',
                  background: selected ? '#F3F0FF' : '#fafafe',
                  border: `3px solid ${selected ? a.shadow : '#e6e6f0'}`,
                  borderRadius: 18,
                  cursor: 'pointer',
                  boxShadow: selected ? `0 4px 0 ${a.shadow}` : 'none',
                  transition: 'all 0.12s',
                }}
              >
               <div style={{ width: 44, height: 66 }}>
                  <Char />
                </div>
               <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: selected ? a.shadow : '#9a9ab0',
                  }}
                >
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p style={{ color: '#E85454', fontSize: 13, fontWeight: 700, margin: '16px 0 0', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
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
          {loading ? 'Saving…' : 'Save Player'}
        </button>

        <p style={{ textAlign: 'center', margin: '16px 0 0' }}>
          <span
            onClick={() => router.push('/profiles')}
            style={{ color: '#7B6FE8', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            Cancel
          </span>
        </p>
      </div>
    </div>
  );
}

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