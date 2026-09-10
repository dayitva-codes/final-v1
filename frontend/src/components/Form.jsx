import { useState } from 'react';

export function PasswordStrengthMeter({ password }) {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasMinLength, hasNumber, (hasUpper && hasLower), hasSpecial].filter(Boolean).length;

  function getStrengthLabel() {
    if (!password) return { label: 'REQUIRED: Min 8 Characters', color: 'var(--text-dim)' };
    if (!hasMinLength) return { label: `NEED ${8 - password.length} MORE CHARS`, color: 'var(--crimson)' };
    if (score === 1 || score === 2) return { label: 'FAIR (Add numbers/uppercase)', color: 'var(--gold)' };
    if (score === 3) return { label: 'STRONG', color: 'var(--cyan)' };
    return { label: 'TACTICAL GRADE ENCRYPTED', color: 'var(--emerald)' };
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
          {props.required && <span style={{ color: 'var(--crimson)', marginLeft: 3 }}>*</span>}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {guideTag && <span className="guide-pill">{guideTag}</span>}
          {badge && <span className="guide-tag">{badge}</span>}
          {hint && <span className="field-hint">{hint}</span>}
        </div>
      </div>
      <input {...props} />
      {limitRule && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
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
          {props.required && <span style={{ color: 'var(--crimson)', marginLeft: 3 }}>*</span>}
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

export function TagGuide({ title, children, badge = "SYSTEM RULE" }) {
  return (
    <div className="guide-box">
      <div style={{ fontSize: 16 }}>ℹ️</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <strong>{title}</strong>
          <span className="guide-pill">{badge}</span>
        </div>
        <div style={{ lineHeight: 1.45 }}>{children}</div>
      </div>
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
  return (
    <div className="banner-error">
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="banner-success">
      <span style={{ fontSize: 16 }}>✅</span>
      <span>{message}</span>
    </div>
  );
}
