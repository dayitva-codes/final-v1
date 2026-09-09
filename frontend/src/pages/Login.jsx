import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/Form';
import ConfigBar from '../components/ConfigBar';

export default function Login() {
  const { login, googleLogin, googleEnabled } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@ncc.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setBusy(true);
    try {
      await googleLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <ConfigBar />
      <div className="login-shell">
        <div className="auth-brand">
          <div className="brand-mark">N</div>
          <span>NCC COMMAND</span>
          <small>Cadet readiness, managed with purpose.</small>
        </div>
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="eyebrow">SECURE ACCESS</div>
          <h1>Welcome back</h1>
          <p className="sub">Sign in to your battalion workspace.</p>
          <ErrorBanner message={error} />
          {googleEnabled && (
            <>
              <button type="button" className="google-btn" onClick={handleGoogleLogin} aria-label="Continue with Google">
                <span className="google-g">G</span>
                Continue with Google
              </button>
              <div className="auth-divider"><span>or use email</span></div>
            </>
          )}
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          </div>
          <button className="primary" style={{ width: '100%', marginTop: 8 }} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="auth-note">
            New to NCC Command? Choose your role to get started.
          </p>
          <div className="auth-links">
            <a href="/register/cadet" style={{ fontSize: 12, color: 'var(--gold)' }}>Register as Cadet</a>
            <a href="/register/mentor" style={{ fontSize: 12, color: 'var(--gold)' }}>Register as Mentor</a>
          </div>
        </form>
      </div>
    </div>
  );
}
