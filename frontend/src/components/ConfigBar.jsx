import { useState, useEffect } from 'react';
import { getApiBase, setApiBase } from '../api/client';

export default function ConfigBar() {
  const currentBase = getApiBase();
  const [value, setValue] = useState(currentBase);
  const [status, setStatus] = useState('checking'); // 'connected' | 'error' | 'checking'

  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  async function checkHealth(urlToCheck) {
    setStatus('checking');
    try {
      const target = (urlToCheck || currentBase).replace(/\/$/, '');
      const healthUrl = target.endsWith('/api/v1') 
        ? target.replace('/api/v1', '/health')
        : `${target}/health`;
      
      const res = await fetch(healthUrl, { method: 'GET', cache: 'no-cache' }).catch(() => null);
      if (res && res.ok) {
        setStatus('connected');
      } else {
        const res2 = await fetch(`${target}/battalions`, { method: 'GET', cache: 'no-cache' }).catch(() => null);
        setStatus(res2 && res2.ok ? 'connected' : 'error');
      }
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    setValue(currentBase);
    checkHealth(currentBase);
  }, [currentBase]);

  function applyAndReload(newVal) {
    const val = (newVal !== undefined ? newVal : value).trim();
    setApiBase(val);
    window.location.reload();
  }

  return (
    <div className="config-bar" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      background: 'rgba(7, 12, 20, 0.95)',
      borderBottom: '1px solid var(--border)',
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: status === 'connected' ? 'var(--neon-emerald)' : status === 'checking' ? 'var(--gold)' : 'var(--neon-crimson)',
          boxShadow: status === 'connected' ? '0 0 8px var(--neon-emerald)' : status === 'checking' ? '0 0 8px var(--gold)' : '0 0 8px var(--neon-crimson)',
          display: 'inline-block'
        }} />
        <span style={{ color: 'var(--paper-dim)', fontWeight: 600 }}>
          API ENDPOINT:
        </span>
      </div>

      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') applyAndReload(e.target.value); }}
        placeholder={isLocal ? 'http://127.0.0.1:8000/api/v1' : '/api/v1'}
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '4px 8px',
          color: 'var(--paper-bright)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          minWidth: 220
        }}
      />

      <button
        type="button"
        onClick={() => applyAndReload(value)}
        style={{
          background: 'rgba(255, 184, 0, 0.12)',
          border: '1px solid var(--gold)',
          color: 'var(--gold)',
          padding: '3px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600
        }}
      >
        💾 Save & Connect
      </button>

      <button
        type="button"
        onClick={() => applyAndReload(isLocal ? 'http://127.0.0.1:8000/api/v1' : '/api/v1')}
        style={{
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid var(--neon-cyan)',
          color: 'var(--neon-cyan)',
          padding: '3px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600
        }}
      >
        ⚡ Auto-Set ({isLocal ? 'Local' : 'Cloud /api/v1'})
      </button>

      {status === 'error' && (
        <span style={{ color: 'var(--neon-crimson)', fontSize: 11 }}>
          ⚠️ Unreachable. Click <b>⚡ Auto-Set</b> to fix.
        </span>
      )}
    </div>
  );
}
