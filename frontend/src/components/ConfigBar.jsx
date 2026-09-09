import { useState } from 'react';
import { getApiBase, setApiBase } from '../api/client';

export default function ConfigBar() {
  const [value, setValue] = useState(getApiBase());
  const [saved, setSaved] = useState(false);

  function save() {
    setApiBase(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="config-bar">
      <span>API:</span>
      <input value={value} onChange={e => setValue(e.target.value)} onBlur={save} />
      {saved && <span style={{ color: '#2D5F3E' }}>saved — refresh if a page looks stale</span>}
    </div>
  );
}
