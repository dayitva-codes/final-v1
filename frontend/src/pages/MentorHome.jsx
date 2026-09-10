import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Field, Panel, ErrorBanner, SuccessBanner, TagGuide } from '../components/Form';
import { useAuth } from '../context/AuthContext';

export default function MentorHome() {
  const { user } = useAuth();
  const [criteria, setCriteria] = useState([]);
  const [cadetId, setCadetId] = useState('1');
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState('');
  const [cadetScores, setCadetScores] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.listCriteria().then(data => {
      setCriteria(data);
      // Initialize default sample scores
      const initial = {};
      data.forEach(c => { initial[c.id] = 8.0; });
      setScores(initial);
    }).catch(() => {});
  }, []);

  function updateScore(criterionId, value) {
    const num = Math.min(10, Math.max(0, parseFloat(value) || 0));
    setScores(prev => ({ ...prev, [criterionId]: num }));
  }

  function getGrade(score, max) {
    const pct = (score / max) * 100;
    if (pct >= 90) return { tag: 'ALPHA (Distinction)', color: 'var(--emerald)' };
    if (pct >= 75) return { tag: 'BRAVO (Proficient)', color: 'var(--cyan)' };
    if (pct >= 50) return { tag: 'CHARLIE (Satisfactory)', color: 'var(--gold)' };
    return { tag: 'DELTA (Needs Work)', color: 'var(--crimson)' };
  }

  function applyRemarkPreset(text) {
    setRemarks(text);
  }

  async function submitAll(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setBusy(true);
    try {
      const entries = Object.entries(scores).filter(([, v]) => v !== '' && v !== undefined);
      if (entries.length === 0) {
        setError('⚠️ Please assign at least one parameter score before submitting.');
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
      setSuccess(`✅ Successfully recorded ${entries.length} parameter evaluation(s) for Cadet #${cadetId} into Supabase.`);
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
        <div className="eyebrow">
          <span className="live-pulse"></span>
          <span>OFFICER EVALUATION STATION</span>
        </div>
        <h2>Tactical Cadet Evaluation</h2>
        <p>
          {user?.is_verified
            ? '🛡️ Status: Authorized & Cleared for Live Assessment.'
            : '⚠️ Status: Awaiting Admin Verification clearance before score submissions are enabled.'}
        </p>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Panel title="Cadet Target Selection" guideTag="TARGET DOSSIER">
        <div className="field-row" style={{ alignItems: 'flex-end' }}>
          <Field
            label="Target Cadet ID"
            type="number"
            min="1"
            required
            hint="Enter ID from cadet list"
            value={cadetId}
            onChange={e => setCadetId(e.target.value)}
          />
          <button className="secondary" type="button" onClick={loadCadetScores} disabled={!cadetId}>
            🔍 Fetch Current Cadet Scores
          </button>
        </div>
      </Panel>

      {cadetScores && (
        <Panel title={`Current Evaluation Profile — Cadet #${cadetId}`} guideTag="SUPABASE DATA">
          {cadetScores.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No recorded scores yet for this cadet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Evaluation Parameter</th>
                  <th>Recorded Average</th>
                  <th>Max Scale</th>
                  <th>Assessment Band</th>
                </tr>
              </thead>
              <tbody>
                {cadetScores.map(s => {
                  const grade = getGrade(s.average_score, s.max_score);
                  return (
                    <tr key={s.criterion_name}>
                      <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {s.criterion_name.replace(/_/g, ' ')}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--cyan)' }}>
                        {s.average_score}
                      </td>
                      <td>/ {s.max_score}</td>
                      <td>
                        <span className="guide-pill" style={{ color: grade.color, borderColor: grade.color }}>
                          {grade.tag}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      <Panel title="9-Parameter Assessment Matrix" guideTag="TACTICAL SCORING (0.0 — 10.0)">
        <TagGuide title="Scoring Rules & Guidelines" badge="STANDARD MATRIX">
          • Scores range strictly from <strong>0.0 (Minimal)</strong> to <strong>10.0 (Mastery)</strong>.<br/>
          • Adjust the interactive slider or type the score directly to assign assessment values.
        </TagGuide>

        <form onSubmit={submitAll}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {criteria.map(c => {
              const currentVal = scores[c.id] !== undefined ? scores[c.id] : 8.0;
              const grade = getGrade(currentVal, c.max_score);

              return (
                <div
                  key={c.id}
                  style={{
                    background: 'rgba(7, 11, 20, 0.7)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: 13 }}>
                      {c.name.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 11, color: grade.color, fontWeight: 700 }}>
                      {grade.tag.split(' ')[0]}
                    </span>
                  </div>

                  <div className="score-slider-row">
                    <input
                      type="range"
                      min="0"
                      max={c.max_score}
                      step="0.5"
                      value={currentVal}
                      onChange={e => updateScore(c.id, e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max={c.max_score}
                      step="0.5"
                      style={{ width: 62, padding: '4px 6px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                      value={currentVal}
                      onChange={e => updateScore(c.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="field-header">
              <label>Tactical Evaluation Remarks & Directives</label>
              <span className="guide-pill">MENTOR FEEDBACK</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <button type="button" className="quick-fill-btn" onClick={() => applyRemarkPreset('Exemplary drill precision and exceptional posture during parade.')}>
                ⚡ Drill Excellence
              </button>
              <button type="button" className="quick-fill-btn" onClick={() => applyRemarkPreset('Demonstrated high-morale leadership and effective squad command.')}>
                ⚡ High Leadership
              </button>
              <button type="button" className="quick-fill-btn" onClick={() => applyRemarkPreset('Recommended for intensive physical stamina conditioning and endurance training.')}>
                ⚡ Fitness Routine
              </button>
            </div>
            <textarea
              rows="3"
              placeholder="Provide strategic feedback and encouragement for cadet development..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>

          <button className="primary" style={{ width: '100%', marginTop: 16 }} disabled={busy || !cadetId}>
            {busy ? 'TRANSMITTING SCORES TO CLOUD…' : '⚡ TRANSMIT CADET EVALUATION RECORD'}
          </button>
        </form>
      </Panel>
    </div>
  );
}
