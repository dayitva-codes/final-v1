import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Panel, ErrorBanner } from '../components/Form';

export default function CadetHome() {
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMyCadetProfile()
      .then(p => {
        setProfile(p);
        return api.getCadetScores(p.id);
      })
      .then(setScores)
      .catch(err => setError(err.message));
  }, []);

  async function loadInsight() {
    if (!profile) return;
    setInsightLoading(true);
    setError('');
    try {
      const data = await api.getCadetInsight(profile.id);
      setInsight(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setInsightLoading(false);
    }
  }

  const overallAvg = scores.length
    ? (scores.reduce((sum, s) => sum + s.average_score, 0) / scores.length).toFixed(1)
    : '—';

  return (
    <div>
      <div className="page-header">
        <h2>{profile ? profile.full_name : 'My Profile'}</h2>
        <p>{profile ? `${profile.enrollment_number} · Wing ${profile.wing} · Year ${profile.academic_year}` : ''}</p>
      </div>
      <ErrorBanner message={error} />

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-box"><div className="value">{overallAvg}</div><div className="label">Overall average</div></div>
        <div className="stat-box"><div className="value">{scores.length}</div><div className="label">Criteria scored</div></div>
        <div className="stat-box"><div className="value">{profile?.ncc_goal ? '✓' : '—'}</div><div className="label">NCC goal set</div></div>
      </div>

      <Panel title="Performance by criterion">
        {scores.length === 0 ? (
          <p style={{ color: 'var(--paper-dim)', fontSize: 13 }}>No evaluations recorded yet — check back after your mentor scores you.</p>
        ) : (
          <table>
            <thead><tr><th>Criterion</th><th>Average</th><th>Max</th></tr></thead>
            <tbody>
              {scores.map(s => (
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

      <Panel title="✨ AI Performance Insight">
        {!insight ? (
          <button className="primary" onClick={loadInsight} disabled={insightLoading}>
            {insightLoading ? 'Generating…' : 'Generate my weekly insight'}
          </button>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--paper-dim)', marginBottom: 12 }}>{insight.summary}</p>
            <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 8 }}>WEAK AREAS TO FOCUS ON</div>
            <p style={{ fontSize: 13, marginBottom: 16 }}>{insight.weak_areas.join(', ')}</p>
            <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 8 }}>THIS WEEK'S PLAN</div>
            {insight.plan.map((task, i) => (
              <div className="insight-block" key={i}>
                <div className="focus">{task.focus_area}</div>
                <div className="action">{task.action}</div>
              </div>
            ))}
            <button className="secondary" onClick={loadInsight} disabled={insightLoading} style={{ marginTop: 8 }}>
              {insightLoading ? 'Regenerating…' : 'Regenerate'}
            </button>
          </>
        )}
      </Panel>
    </div>
  );
}
