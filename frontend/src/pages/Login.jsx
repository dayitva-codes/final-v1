import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner, TagGuide, PasswordStrengthMeter } from '../components/Form';
import ConfigBar from '../components/ConfigBar';

export default function Login() {
  const { login, googleLogin, googleEnabled } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@ncc.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function quickFill(fillEmail, fillPass) {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters for login authentication.');
      return;
    }
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
        <div className="login-card">
          <div className="eyebrow">
            <span className="live-pulse"></span>
            <span>NCC CYBER-COMMAND GATEWAY</span>
          </div>
          <h1>Command Access</h1>
          <p className="sub">Authenticate to access your battalion management console.</p>

          <ErrorBanner message={error} />

          <div className="quick-fill-bar">
            <span style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>⚡ QUICK LOGIN:</span>
            <button
              type="button"
              className="quick-fill-btn"
              onClick={() => quickFill('admin@ncc.local', 'admin123')}
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              className="quick-fill-btn"
              onClick={() => quickFill('mentor1@test.com', 'password123')}
            >
              🎖️ Mentor
            </button>
            <button
              type="button"
              className="quick-fill-btn"
              onClick={() => quickFill('cadet1@test.com', 'password123')}
            >
              🎯 Cadet
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {googleEnabled && (
              <>
                <button type="button" className="google-btn" onClick={handleGoogleLogin} aria-label="Continue with Google">
                  <span className="google-g">G</span>
                  Continue with Google Auth
                </button>
                <div className="auth-divider"><span>or use credentials</span></div>
              </>
            )}

            <div className="field">
              <div className="field-header">
                <label htmlFor="email">Email Address</label>
                <span className="guide-pill">IDENTITY</span>
              </div>
              <input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="name@battalion.ncc"
                required
              />
            </div>

            <div className="field">
              <div className="field-header">
                <label htmlFor="password">Password</label>
                <span className="guide-pill">SECURITY KEY</span>
              </div>
              <input
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <button className="primary" style={{ width: '100%', marginTop: 14 }} disabled={busy}>
              {busy ? 'AUTHENTICATING ENCRYPTED SESSION…' : '⚡ SIGN IN TO COMMAND'}
            </button>
          </form>

          <TagGuide title="System Access Roles" badge="GUIDE">
            • <strong>Admin</strong>: Create battalions/colleges, verify mentors.<br/>
            • <strong>Mentor</strong>: Evaluate cadets on 9 criteria (requires admin verification).<br/>
            • <strong>Cadet</strong>: Track real-time ranking, scores, and AI performance insights.
          </TagGuide>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <a href="/register/cadet" style={{ fontSize: 13, color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
              + Register as Cadet →
            </a>
            <a href="/register/mentor" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
              + Register as Mentor →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
