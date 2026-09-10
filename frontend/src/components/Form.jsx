import { useState } from 'react';
import { setApiBase } from '../api/client';

export function PasswordStrengthMeter({ password }) {
  const hasMinLength = (password || '').length >= 8;
  const hasNumber = /\d/.test(password || '');
  const hasUpper = /[A-Z]/.test(password || '');
  const hasLower = /[a-z]/.test(password || '');
  const hasSpecial = /[^A-Za-z0-9]/.test(password || '');

  const score = [hasMinLength, hasNumber, (hasUpper && hasLower), hasSpecial].filter(Boolean).length;

  function getStrengthLabel() {
    if (!password) return { label: 'REQUIRED: Min 8 Characters', color: 'var(--paper-dim)' };
    if (!hasMinLength) return { label: `NEED ${8 - password.length} MORE CHARS`, color: 'var(--neon-crimson)' };
    if (score === 1 || score === 2) return { label: 'FAIR (Add numbers/uppercase)', color: 'var(--gold)' };
    if (score === 3) return { label: 'STRONG', color: 'var(--neon-cyan)' };
    return { label: 'TACTICAL GRADE ENCRYPTED', color: 'var(--neon-emerald)' };
  }

  const { label, color } = getStrengthLabel();

  return (
    <div className="password-meter-container">
      <div className="password-bars">
        {[1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            className="password-bar-segment"
            style={{
              background: idx <= score && hasMinLength ? color : 'rgba(255,255,255,0.08)',
              boxShadow: idx <= score && hasMinLength ? `0 0 8px ${color}` : 'none',
            }}
          />
        ))}
      </div>
      <div className="password-rules-list">
        <span className={`password-rule-item ${hasMinLength ? 'valid' : ''}`}>
          {hasMinLength ? '✓' : '•'} 8+ Chars
        </span>
        <span className={`password-rule-item ${hasNumber ? 'valid' : ''}`}>
          {hasNumber ? '✓' : '•'} Number
        </span>
        <span className={`password-rule-item ${(hasUpper && hasLower) ? 'valid' : ''}`}>
          {(hasUpper && hasLower) ? '✓' : '•'} Upper & Lower
        </span>
        <span style={{ marginLeft: 'auto', color: color, fontWeight: 700 }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function Field({ label, hint, guideTag, badge, limitRule, rightElement, ...props }) {
  return (
    <div className="field">
      <div className="field-header">
        <label>
          {label}
          {props.required && <span style={{ color: 'var(--neon-crimson)', marginLeft: 3 }}>*</span>}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {guideTag && <span className="guide-pill">{guideTag}</span>}
          {badge && <span className="guide-tag">{badge}</span>}
          {hint && <span className="field-hint">{hint}</span>}
        </div>
      </div>
      <input {...props} />
      {limitRule && (
        <div style={{ fontSize: 11, color: 'var(--paper-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
          ⚙️ Rule: {limitRule}
        </div>
      )}
      {rightElement}
    </div>
  );
}

export function SelectField({ label, options, hint, guideTag, badge, ...props }) {
  return (
    <div className="field">
      <div className="field-header">
        <label>
          {label}
          {props.required && <span style={{ color: 'var(--neon-crimson)', marginLeft: 3 }}>*</span>}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {guideTag && <span className="guide-pill">{guideTag}</span>}
          {badge && <span className="guide-tag">{badge}</span>}
          {hint && <span className="field-hint">{hint}</span>}
        </div>
      </div>
      <select {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function TagGuide({ tags = [], guide, title = "OPERATIONAL PROTOCOL" }) {
  return (
    <div className="guide-box" style={{
      background: 'rgba(10, 18, 30, 0.65)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 700, letterSpacing: '0.08em' }}>
          {title}:
        </span>
        {tags.map((t, idx) => (
          <span key={idx} style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            color: 'var(--paper-bright)',
            padding: '2px 8px',
            borderRadius: 4
          }}>
            {t}
          </span>
        ))}
      </div>
      {guide && (
        <div style={{ fontSize: 12, color: 'var(--paper-dim)', lineHeight: 1.4 }}>
          {guide}
        </div>
      )}
    </div>
  );
}

export function Panel({ title, guideTag, actions, children }) {
  return (
    <div className="panel">
      {(title || guideTag || actions) && (
        <div className="panel-header">
          <h3>
            {title}
            {guideTag && <span className="guide-tag">{guideTag}</span>}
          </h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  const isConnError = typeof message === 'string' && message.includes('Could not reach the API');

  const switchEndpoint = (newBase) => {
    setApiBase(newBase);
    window.location.reload();
  };

  return (
    <div className="banner-error" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '14px 16px',
      background: 'rgba(255, 0, 85, 0.12)',
      border: '1px solid var(--neon-crimson)',
      borderRadius: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ fontSize: 13, color: '#ffb3c1', lineHeight: 1.4 }}>{message}</span>
      </div>

      {isConnError && (
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255, 0, 85, 0.25)',
          paddingTop: 8,
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--paper-dim)' }}>
            1-CLICK RESOLVE:
          </span>
          <button
            type="button"
            onClick={() => switchEndpoint('/api/v1')}
            style={{
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            ⚡ Switch to Cloud API (/api/v1)
          </button>
          <button
            type="button"
            onClick={() => switchEndpoint('http://127.0.0.1:8000/api/v1')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border)',
              color: 'var(--paper-bright)',
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            💻 Switch to Localhost (8000)
          </button>
        </div>
      )}
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="banner-success" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      background: 'rgba(0, 255, 170, 0.1)',
      border: '1px solid var(--neon-emerald)',
      borderRadius: 8,
      color: 'var(--neon-emerald)',
      fontSize: 13
    }}>
      <span style={{ fontSize: 18 }}>✅</span>
      <span>{message}</span>
    </div>
  );
}
