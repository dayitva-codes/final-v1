import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Field, SelectField, Panel, ErrorBanner, SuccessBanner, TagGuide, PasswordStrengthMeter } from '../components/Form';
import ConfigBar from '../components/ConfigBar';

export default function RegisterMentor() {
  const navigate = useNavigate();
  const [battalions, setBattalions] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', enrollment_number: '',
    scope_level: 'institute', college_id: '', battalion_id: '',
  });

  useEffect(() => { api.listBattalions().then(setBattalions).catch(() => {}); }, []);
  useEffect(() => {
    if (form.battalion_id) api.listColleges(form.battalion_id).then(setColleges).catch(() => {});
  }, [form.battalion_id]);

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function autoFillSample() {
    const randomId = Math.floor(100 + Math.random() * 900);
    setForm({
      email: `mentor_${randomId}@ncc.local`,
      password: 'MentorPassword123!',
      enrollment_number: `MENTOR${randomId}`,
      scope_level: 'institute',
      battalion_id: battalions[0]?.id ? String(battalions[0].id) : '1',
      college_id: colleges[0]?.id ? String(colleges[0].id) : '1',
    });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.password.length < 8) {
      setError('⚠️ Security Rule Violation: Password must be at least 8 characters long.');
      return;
    }

    if (form.scope_level === 'institute' && !form.college_id) {
      setError('⚠️ Scope Rule Violation: Institute-level mentors must select an attached college.');
      return;
    }

    if (form.scope_level === 'multi_college' && !form.battalion_id) {
      setError('⚠️ Scope Rule Violation: Multi-college mentors must select an attached battalion.');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        enrollment_number: form.enrollment_number,
        scope_level: form.scope_level,
      };
      if (form.scope_level === 'institute') payload.college_id = parseInt(form.college_id);
      else payload.battalion_id = parseInt(form.battalion_id);

      const res = await api.registerMentor(payload);
      setSuccess(`Mentor registered with User ID #${res.user_id || res.id}. An Admin must verify your account before you can evaluate cadets.`);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ConfigBar />
      <div style={{ maxWidth: 580, margin: '36px auto', padding: '0 16px' }}>
        <div className="page-header">
          <div className="eyebrow">
            <span className="live-pulse"></span>
            <span>OFFICER & MENTOR REGISTRATION</span>
          </div>
          <h2>Mentor Registration</h2>
          <p>Register as an NCC ANO / PI Staff / Evaluator to assess cadets and generate performance reports.</p>
        </div>

        <div className="quick-fill-bar">
          <span style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>⚡ FAST TESTING:</span>
          <button type="button" className="quick-fill-btn" onClick={autoFillSample}>
            Fill Sample Mentor Details
          </button>
        </div>

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <TagGuide title="Admin Verification Requirement" badge="SECURITY POLICY">
          Newly registered mentors start in an <strong>Unverified</strong> state. An <strong>Admin</strong> must approve your User ID from the Command Setup portal before score submissions are permitted.
        </TagGuide>

        <form onSubmit={handleSubmit}>
          <Panel title="1. Account Credentials" guideTag="MIN 8 CHARACTERS">
            <div className="field-row">
              <Field
                label="Officer Email"
                type="email"
                required
                placeholder="officer@unit.ncc"
                value={form.email}
                onChange={e => update('email', e.target.value)}
              />
              <Field
                label="Password"
                type="password"
                required
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
              />
            </div>
            <PasswordStrengthMeter password={form.password} />
          </Panel>

          <Panel title="2. Official Scope & Placement" guideTag="AUTHORIZATION LEVEL">
            <Field
              label="Mentor Enrollment / Service ID"
              required
              placeholder="e.g. MENT001 or ANO/2026/09"
              value={form.enrollment_number}
              onChange={e => update('enrollment_number', e.target.value.toUpperCase())}
            />

            <SelectField
              label="Evaluation Scope Level"
              required
              badge="PERMISSIONS"
              value={form.scope_level}
              onChange={e => update('scope_level', e.target.value)}
              options={[
                { value: 'institute', label: '🏫 Institute-Level (Evaluates Cadets in 1 Specific College)' },
                { value: 'multi_college', label: '🎖️ Multi-College / Battalion Level (Evaluates All Colleges in Battalion)' },
              ]}
            />

            {form.scope_level === 'institute' ? (
              <div className="field-row">
                <SelectField
                  label="Battalion"
                  required
                  value={form.battalion_id}
                  onChange={e => update('battalion_id', e.target.value)}
                  options={[{ value: '', label: '— Select Battalion —' }, ...battalions.map(b => ({ value: b.id, label: b.name }))]}
                />
                <SelectField
                  label="Assigned College"
                  required
                  value={form.college_id}
                  onChange={e => update('college_id', e.target.value)}
                  options={[{ value: '', label: form.battalion_id ? '— Select College —' : '— Choose Battalion First —' }, ...colleges.map(c => ({ value: c.id, label: c.name }))]}
                />
              </div>
            ) : (
              <SelectField
                label="Assigned Battalion"
                required
                value={form.battalion_id}
                onChange={e => update('battalion_id', e.target.value)}
                options={[{ value: '', label: '— Select Battalion —' }, ...battalions.map(b => ({ value: b.id, label: b.name }))]}
              />
            )}
          </Panel>

          <button className="primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'ENROLLING MENTOR…' : '⚡ SUBMIT MENTOR REGISTRATION'}
          </button>
        </form>
      </div>
    </div>
  );
}
