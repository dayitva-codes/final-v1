import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Field, Panel, ErrorBanner } from '../components/Form';

export default function Leaderboard() {
  const [battalionId, setBattalionId] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  async function load() {
    setError('');
    try {
      const data = await api.getLeaderboard(battalionId || null);
      setRows(data);
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  function rankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  }

  return (
    <div>
      <div className="page-header">
        <h2>Leaderboard</h2>
        <p>Ranked live from recorded evaluation averages — not a stored, stale number.</p>
      </div>
      <ErrorBanner message={error} />

      <Panel>
        <div className="field-row" style={{ alignItems: 'flex-end' }}>
          <Field label="Filter by Battalion ID (optional)" value={battalionId} onChange={e => setBattalionId(e.target.value)} />
          <button className="secondary" type="button" onClick={load}>Refresh</button>
        </div>
      </Panel>

      <Panel>
        {loaded && rows.length === 0 ? (
          <p style={{ color: 'var(--paper-dim)', fontSize: 13 }}>No evaluated cadets yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Rank</th><th>Cadet</th><th>Enrollment</th><th>College</th><th>Avg. Score</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.cadet_id}>
                  <td className={rankClass(r.rank)}>#{r.rank}</td>
                  <td>{r.full_name}</td>
                  <td>{r.enrollment_number}</td>
                  <td>{r.college_name}</td>
                  <td>{r.average_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
