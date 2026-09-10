import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Panel, ErrorBanner, TagGuide } from '../components/Form';

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

  const getScoreColor = (val) => {
    if (val >= 8.0) return 'var(--neon-emerald)';
    if (val >= 6.0) return 'var(--gold)';
    return 'var(--neon-crimson)';
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>{profile ? profile.full_name : 'Cadet Terminal'}</h2>
          {profile && (
            <span style={{
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em'
            }}>
              {profile.wing} WING · YR {profile.academic_year}
            </span>
          )}
        </div>
        <p style={{ marginTop: 6 }}>
          {profile ? `Dossier ID: ${profile.enrollment_number} · Gender Division: ${profile.gender}` : 'Loading verified cadet credentials...'}
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-box" style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }}>
          <div className="value" style={{ color: 'var(--neon-cyan)' }}>{overallAvg}</div>
          <div className="label">Composite Index (10.0 max)</div>
        </div>
        <div className="stat-box">
          <div className="value" style={{ color: 'var(--gold)' }}>{scores.length} / 9</div>
          <div className="label">Evaluation Criteria Scored</div>
        </div>
        <div className="stat-box" style={{ borderColor: profile?.ncc_goal ? 'rgba(0, 255, 170, 0.3)' : 'var(--border)' }}>
          <div className="value" style={{ color: profile?.ncc_goal ? 'var(--neon-emerald)' : 'var(--paper-dim)' }}>
            {profile?.ncc_goal ? 'ACTIVE' : 'NONE'}
          </div>
          <div className="label">Career Track Directive</div>
        </div>
      </div>

      {profile?.ncc_goal && (
        <div style={{
          background: 'rgba(10, 18, 30, 0.65)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: 8,
          padding: '12px 18px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>🎯</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--paper-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Declared NCC Goal</div>
            <div style={{ fontSize: 13, color: 'var(--paper-bright)', fontWeight: 500 }}>{profile.ncc_goal}</div>
          </div>
        </div>
      )}

      <Panel title="Evaluation Matrix Breakdown">
        <TagGuide
          tags={['9 Rigorous Dimensions', '0.0 - 10.0 Standard Scale', 'Mentor Verified']}
          guide="Official scores submitted by authorized battalion evaluators across standard NCC assessment pillars."
        />

        {scores.length === 0 ? (
          <div style={{
            padding: 32,
            textAlign: 'center',
            color: 'var(--paper-dim)',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px dashed var(--border)'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--paper-bright)' }}>No official evaluations recorded yet</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>Your mentor will record your 9-parameter score assessment during scheduled parade drills.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {scores.map(s => {
              const scoreVal = s.average_score;
              const percent = Math.min(100, Math.max(0, (scoreVal / 10) * 100));
              const color = getScoreColor(scoreVal);
              return (
                <div key={s.criterion_name} style={{
                  background: 'rgba(13, 22, 38, 0.7)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 13, color: 'var(--paper-bright)' }}>
                      {s.criterion_name.replace(/_/g, ' ')}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: 14,
                      color: color
                    }}>
                      {scoreVal.toFixed(1)} <span style={{ fontSize: 10, color: 'var(--paper-dim)' }}>/ 10</span>
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: 6,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 999,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                      boxShadow: `0 0 8px ${color}88`,
                      borderRadius: 999,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="✨ AI Strategic Performance Advisory">
        <TagGuide
          tags={['Synthetic Intelligence Engine', 'Targeted Remediation', 'Weekly Drill Schedule']}
          guide="Dynamic analysis powered by AI evaluating your score vectors to pinpoint bottlenecks and structure weekly enhancement protocols."
        />

        {!insight ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <button className="primary" onClick={loadInsight} disabled={insightLoading} style={{ padding: '12px 28px', fontSize: 14 }}>
              {insightLoading ? '⚡ Synthesizing AI Analytics…' : '⚡ Generate AI Strategic Protocol'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--paper-dim)', marginTop: 10 }}>
              Generates personalized tactical focus areas and daily drill regimens based on your current evaluation matrix.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgba(0, 240, 255, 0.04)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: 8,
              padding: 16
            }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', marginBottom: 6, letterSpacing: '0.08em' }}>
                TACTICAL SUMMARY
              </div>
              <p style={{ fontSize: 13, color: 'var(--paper-bright)', margin: 0, lineHeight: 1.5 }}>
                {insight.summary}
              </p>
            </div>

            {insight.weak_areas && insight.weak_areas.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--neon-crimson)', marginBottom: 8, letterSpacing: '0.08em' }}>
                  ⚠️ PRIORITY FOCUS VECTORS
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {insight.weak_areas.map((w, i) => (
                    <span key={i} style={{
                      background: 'rgba(255, 0, 85, 0.1)',
                      border: '1px solid rgba(255, 0, 85, 0.3)',
                      color: 'var(--neon-crimson)',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)', marginBottom: 8, letterSpacing: '0.08em' }}>
                📅 7-DAY ACTION REGIMEN
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insight.plan.map((task, i) => (
                  <div className="insight-block" key={i} style={{ margin: 0 }}>
                    <div className="focus" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: 'rgba(255, 184, 0, 0.2)',
                        color: 'var(--gold)',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {i + 1}
                      </span>
                      {task.focus_area}
                    </div>
                    <div className="action">{task.action}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="secondary" onClick={loadInsight} disabled={insightLoading}>
                {insightLoading ? 'Refreshing Protocol…' : '🔄 Refresh AI Protocol'}
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
