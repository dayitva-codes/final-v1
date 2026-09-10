import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Field, SelectField, Panel, ErrorBanner, SuccessBanner, TagGuide } from '../components/Form';

export default function AdminHome() {
  const [battalions, setBattalions] = useState([]);
  const [activeTab, setActiveTab] = useState('battalion');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const [battForm, setBattForm] = useState({ name: '', code: '' });
  const [collForm, setCollForm] = useState({ battalion_id: '', name: '', academic_year_start: '2026' });
  const [verifyUserId, setVerifyUserId] = useState('');

  function refreshBattalions() {
    api.listBattalions().then(setBattalions).catch(() => {});
  }
  useEffect(refreshBattalions, []);

  async function createBattalion(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    const cleanCode = battForm.code.trim().toUpperCase();
    if (cleanCode.length < 3 || cleanCode.length > 12) {
      setError('⚠️ Battalion Code Rule Violation: Code must be between 3 and 12 alphanumeric characters.');
      return;
    }

    setBusy(true);
    try {
      await api.createBattalion({ ...battForm, code: cleanCode });
      setSuccess(`✅ Battalion "${battForm.name}" [${cleanCode}] established successfully in Supabase.`);
      setBattForm({ name: '', code: '' });
      refreshBattalions();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function createCollege(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!collForm.battalion_id) {
      setError('⚠️ Please select a Battalion for this College.');
      return;
    }

    const year = parseInt(collForm.academic_year_start);
    if (isNaN(year) || year < 2000 || year > 2050) {
      setError('⚠️ Academic Year Rule Violation: Start year must be a valid 4-digit year (e.g. 2026).');
      return;
    }

    setBusy(true);
    try {
      await api.createCollege({
        ...collForm,
        battalion_id: parseInt(collForm.battalion_id),
        academic_year_start: year,
      });
      setSuccess(`✅ College "${collForm.name}" attached to Battalion successfully.`);
      setCollForm({ battalion_id: '', name: '', academic_year_start: '2026' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyMentor(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const userIdNum = parseInt(verifyUserId);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      setError('⚠️ Mentor Verification Rule: User ID must be a positive integer.');
      return;
    }

    setBusy(true);
    try {
      await api.verifyMentor(userIdNum);
      setSuccess(`✅ Mentor (User ID #${userIdNum}) is verified and authorized for evaluation duties.`);
      setVerifyUserId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">
          <span className="live-pulse"></span>
          <span>BATTALION COMMAND HQ & MASTER REGISTRY</span>
        </div>
        <h2>Command Administration</h2>
        <p>Manage organizational hierarchy, establish new battalions & colleges, and authorize evaluation personnel.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="value">{battalions.length}</div>
          <div className="label">Registered Battalions</div>
        </div>
        <div className="stat-box">
          <div className="value" style={{ color: 'var(--emerald)' }}>ACTIVE</div>
          <div className="label">Supabase DBMS Grid</div>
        </div>
        <div className="stat-box">
          <div className="value" style={{ color: 'var(--cyan)' }}>LEVEL 1</div>
          <div className="label">Master Security Clearance</div>
        </div>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <button
          type="button"
          className={`cyber-tab ${activeTab === 'battalion' ? 'active' : ''}`}
          onClick={() => setActiveTab('battalion')}
        >
          🏰 1. Register Battalion
        </button>
        <button
          type="button"
          className={`cyber-tab ${activeTab === 'college' ? 'active' : ''}`}
          onClick={() => setActiveTab('college')}
        >
          🏫 2. Attach College
        </button>
        <button
          type="button"
          className={`cyber-tab ${activeTab === 'mentor' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentor')}
        >
          🛡️ 3. Authorize Mentor
        </button>
      </div>

      {activeTab === 'battalion' && (
        <Panel title="Establish New Battalion" guideTag="RULE: UNIQUE CODE">
          <TagGuide title="Battalion Code Requirement" badge="UNIQUE KEY">
            Battalion code must be unique across all units (e.g. <code>3MPGBN</code>, <code>1MPNU</code>, <code>4DELHIARMY</code>). Automatically uppercase.
          </TagGuide>
          <form onSubmit={createBattalion}>
            <div className="field-row">
              <Field
                label="Battalion Name"
                required
                placeholder="e.g. 3 MP Girls Battalion"
                value={battForm.name}
                onChange={e => setBattForm({ ...battForm, name: e.target.value })}
              />
              <Field
                label="Battalion Code"
                required
                hint="3-12 Alphanumeric"
                placeholder="e.g. 3MPGBN"
                value={battForm.code}
                onChange={e => setBattForm({ ...battForm, code: e.target.value.toUpperCase() })}
              />
            </div>
            <button className="primary" disabled={busy}>
              {busy ? 'CREATING BATTALION…' : '⚡ ESTABLISH BATTALION UNIT'}
            </button>
          </form>
        </Panel>
      )}

      {activeTab === 'college' && (
        <Panel title="Attach College to Battalion" guideTag="AFFILIATION">
          <TagGuide title="College Placement Hierarchy" badge="HIERARCHY">
            Cadets will select their college under the corresponding battalion during registration.
          </TagGuide>
          <form onSubmit={createCollege}>
            <div className="field-row">
              <SelectField
                label="Parent Battalion"
                required
                value={collForm.battalion_id}
                onChange={e => setCollForm({ ...collForm, battalion_id: e.target.value })}
                options={[{ value: '', label: '— Select Parent Battalion —' }, ...battalions.map(b => ({ value: b.id, label: `${b.name} (${b.code})` }))]}
              />
              <Field
                label="College / Institute Name"
                required
                placeholder="e.g. Govt Girls College"
                value={collForm.name}
                onChange={e => setCollForm({ ...collForm, name: e.target.value })}
              />
              <Field
                label="Academic Year Start"
                type="number"
                required
                limitRule="4-digit year (e.g. 2026)"
                value={collForm.academic_year_start}
                onChange={e => setCollForm({ ...collForm, academic_year_start: e.target.value })}
              />
            </div>
            <button className="primary" disabled={busy}>
              {busy ? 'ATTACHING COLLEGE…' : '⚡ ATTACH COLLEGE TO BATTALION'}
            </button>
          </form>
        </Panel>
      )}

      {activeTab === 'mentor' && (
        <Panel title="Authorize & Verify Mentor" guideTag="SECURITY APPROVAL">
          <TagGuide title="Mentor Verification Workflow" badge="ROLE GATING">
            Enter the <strong>User ID</strong> of the mentor to grant them permission to score cadets and access the 9-parameter evaluation matrix.
          </TagGuide>
          <form onSubmit={verifyMentor}>
            <Field
              label="Mentor's Registered User ID"
              type="number"
              required
              hint="Check user ID in mentor registration confirmation"
              placeholder="e.g. 2"
              value={verifyUserId}
              onChange={e => setVerifyUserId(e.target.value)}
            />
            <button className="primary" disabled={busy}>
              {busy ? 'VERIFYING…' : '🛡️ APPROVE & AUTHORIZE MENTOR'}
            </button>
          </form>
        </Panel>
      )}

      <Panel title="Battalion Master Registry" guideTag="LIVE SUPABASE RECORDS">
        {battalions.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No battalions created yet. Use tab 1 above to establish your first unit.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Unit ID</th>
                <th>Battalion Title</th>
                <th>Unit Code</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {battalions.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>#{b.id}</td>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td><span className="guide-pill">{b.code}</span></td>
                  <td><span className="guide-tag">ACTIVE UNIT</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
