export function Field({ label, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}

export function SelectField({ label, options, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Panel({ title, children }) {
  return (
    <div className="panel">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="banner-error">{message}</div>;
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return <div className="banner-success">{message}</div>;
}
