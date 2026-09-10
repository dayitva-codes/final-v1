import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { Field, Panel, ErrorBanner, TagGuide } from '../components/Form';

export default function Leaderboard() {
  const [battalionId, setBattalionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLeaderboard(battalionId || null);
      setRows(data);
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(r =>
      r.full_name?.toLowerCase().includes(q) ||
      r.enrollment_number?.toLowerCase().includes(q) ||
      r.college_name?.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  const topThree = filteredRows.slice(0, 3);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Command Leaderboard</h2>
          <span style={{
            background: 'rgba(255, 184, 0, 0.12)',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            padding: '3px 10px',
            borderRadius: '999px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em'
          }}>
            LIVE AGGREGATE
          </span>
        </div>
        <p style={{ marginTop: 6 }}>
          Real-time cadet rankings computed on-the-fly from PostgreSQL database evaluations across all battalions.
        </p>
      </div>

      <ErrorBanner message={error} />

      <TagGuide
        tags={['Live PostgreSQL Compute', 'Multi-Criterion Average', 'Zero Stale Cache', 'Battalion Scoped']}
        guide="Leaderboards update dynamically with each signed mentor evaluation. Filter by specific Battalion ID or search across any active cadet name."
      />

      <Panel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
          <Field
            label="Instant Cadet / College Search"
            badge="Real-time"
            placeholder="Search cadet name, reg. no., college..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Field
            label="Filter by Battalion UUID"
            badge="Optional"
            placeholder="e.g. 5d1341a7-..."
            value={battalionId}
            onChange={e => setBattalionId(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" type="button" onClick={load} disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Refreshing…' : '⚡ Query Ranks'}
            </button>
            {battalionId && (
              <button className="secondary" type="button" onClick={() => { setBattalionId(''); setTimeout(load, 50); }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </Panel>

      {/* Top 3 Holographic Podium Cards */}
      {topThree.length >= 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
          {topThree.map((top, idx) => {
            const rank = idx + 1;
            const colors = {
              1: { border: 'var(--gold)', bg: 'rgba(255, 184, 0, 0.08)', text: 'var(--gold)', icon: '👑 GOLD', glow: '0 0 20px rgba(255, 184, 0, 0.25)' },
              2: { border: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.08)', text: '#E0E0E0', icon: '🥈 SILVER', glow: '0 0 16px rgba(192, 192, 192, 0.2)' },
              3: { border: '#CD7F32', bg: 'rgba(205, 127, 50, 0.08)', text: '#E59866', icon: '🥉 BRONZE', glow: '0 0 16px rgba(205, 127, 50, 0.2)' }
            }[rank];

            return (
              <div key={top.cadet_id} style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: colors.glow,
                borderRadius: 10,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 12,
                    color: colors.text,
                    letterSpacing: '0.08em'
                  }}>
                    {colors.icon} · #{rank}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 20,
                    color: colors.text
                  }}>
                    {Number(top.average_score).toFixed(2)}
                  </span>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--paper-bright)' }}>
                    {top.full_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--paper-dim)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {top.enrollment_number}
                  </div>
                </div>

                <div style={{
                  fontSize: 11,
                  color: 'var(--paper-dim)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>🏛️</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {top.college_name || 'Battalion Cadet'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Ranks Table */}
      <Panel title={`Cadet Standings (${filteredRows.length} Cadets Listed)`}>
        {loaded && filteredRows.length === 0 ? (
          <div style={{
            padding: 32,
            textAlign: 'center',
            color: 'var(--paper-dim)',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px dashed var(--border)'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--paper-bright)' }}>No evaluated cadets matching criteria</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>Check your search filter or ensure mentors have recorded scores.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Rank</th>
                  <th>Cadet Name</th>
                  <th>Enrollment Reg</th>
                  <th>Affiliated College</th>
                  <th style={{ textAlign: 'right' }}>Composite Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, idx) => {
                  const displayRank = r.rank || (idx + 1);
                  const isTop3 = displayRank <= 3;
                  return (
                    <tr key={r.cadet_id} style={{
                      background: displayRank === 1 ? 'rgba(255, 184, 0, 0.04)' : undefined
                    }}>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: 13,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: displayRank === 1 ? 'rgba(255, 184, 0, 0.15)' :
                                     displayRank === 2 ? 'rgba(192, 192, 192, 0.15)' :
                                     displayRank === 3 ? 'rgba(205, 127, 50, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          color: displayRank === 1 ? 'var(--gold)' :
                                 displayRank === 2 ? '#E0E0E0' :
                                 displayRank === 3 ? '#E59866' : 'var(--paper-dim)',
                          border: isTop3 ? '1px solid currentColor' : 'none'
                        }}>
                          #{displayRank}
                        </span>
                      </td>
                      <td style={{ fontWeight: isTop3 ? 600 : 400, color: isTop3 ? 'var(--paper-bright)' : 'var(--paper)' }}>
                        {r.full_name}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--paper-dim)' }}>
                        {r.enrollment_number}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--paper-dim)' }}>
                        {r.college_name || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: 14,
                          color: Number(r.average_score) >= 8.0 ? 'var(--neon-emerald)' :
                                 Number(r.average_score) >= 6.0 ? 'var(--gold)' : 'var(--neon-crimson)'
                        }}>
                          {Number(r.average_score).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
