'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get('next') || '/';
        // Use a full navigation so middleware re-evaluates with the new cookie.
        window.location.assign(next.startsWith('/') ? next : '/');
        return;
      }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="eyebrow">Frontier Benchmark</div>
        <h2 style={{ marginBottom: 6 }}>Sign in</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 20 }}>
          Enter the dashboard password to continue.
        </p>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <div className="login-error">Incorrect password. Try again.</div> : null}
        <button className="btn btn-pill" type="submit" disabled={loading || password.length === 0}>
          {loading ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
