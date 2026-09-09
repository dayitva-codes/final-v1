import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Field, Panel, ErrorBanner, SuccessBanner } from '../components/Form';
import { useAuth } from '../context/AuthContext';

export default function MentorHome() {
  const { user } = useAuth();
  const [criteria, setCriteria] = useState([]);
  const [cadetId, setCadetId] = useState('');
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState('');
  const [cadetScores, setCadetScores] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.listCriteria().then(setCriteria).catch(() => {}); }, []);

  function updateScore(criterionId, value) {
    setScores(prev => ({ ...prev, [criterionId]: value }));
  }

  async function submitAll(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setBusy(true);
    try {
      const entries = Object.entries(scores).filter(([, v]) => v !== '' && v !== undefined);
      if (entries.length === 0) {
        setError('Enter at least one score before submitting.');
        setBusy(false);
        return;
      }
      for (const [criterionId, score] of entries) {
        await api.submitEvaluation({
          cadet_id: parseInt(cadetId),
          criterion_id: parseInt(criterionId),
          score: parseFloat(score),
          remarks: remarks || null,
        });
      }
      setSuccess(`Submitted ${entries.length} score(s) for cadet #${cadetId}.`);
      setScores({});
      loadCadetScores();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadCadetScores() {
    if (!cadetId) return;
    try {
      const data = await api.getCadetScores(cadetId);
      setCadetScores(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Evaluate Cadets</h2>
        <p>{user?.is_verified ? 'Verified — you can submit scores.' : 'Awaiting admin verification before you can submit scores.'}</p>
      </div>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Panel title="Select cadet">
        <div className="field-row">
          <Field label="Cadet ID" value={cadetId} onChange={e => setCadetId(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="secondary" type="button" onClick={loadCadetScores} disabled={!cadetId}>
              Load current scores
            </button>
          </div>
        </div>
      </Panel>

      {cadetScores && (
        <Panel title={`Current average scores — Cadet #${cadetId}`}>
          {cadetScores.length === 0 ? (
            <p style={{ color: 'var(--paper-dim)', fontSize: 13 }}>No evaluations recorded yet.</p>
          ) : (
            <table>
              <thead><tr><th>Criterion</th><th>Average</th><th>Max</th></tr></thead>
              <tbody>
                {cadetScores.map(s => (
                  <tr key={s.criterion_name}>
                    <td style={{ textTransform: 'capitalize' }}>{s.criterion_name.replace('_', ' ')}</td>
                    <td>{s.average_score}</td>
                    <td>{s.max_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      <Panel title="Submit scores (9-parameter evaluation)">
        <form onSubmit={submitAll}>
          {criteria.map(c => (
            <div className="field" key={c.id}>
              <label style={{ textTransform: 'capitalize' }}>{c.name.replace('_', ' ')} (0–{c.max_score})</label>
              <input
                type="number" min="0" max={c.max_score} step="0.5"
                value={scores[c.id] || ''}
                onChange={e => updateScore(c.id, e.target.value)}
                placeholder={`0 – ${c.max_score}`}
              />
            </div>
          ))}
          <div className="field">
            <label>Remarks (mentor connect)</label>
            <textarea rows="3" value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>
          <button className="primary" disabled={busy || !cadetId}>
            {busy ? 'Submitting…' : 'Submit Evaluation'}
          </button>
        </form>
      </Panel>
    </div>
  );
}
