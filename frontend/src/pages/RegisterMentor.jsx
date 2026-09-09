import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Field, SelectField, Panel, ErrorBanner, SuccessBanner } from '../components/Form';
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setBusy(true);
    try {
      const payload = {
        email: form.email, password: form.password,
        enrollment_number: form.enrollment_number, scope_level: form.scope_level,
      };
      if (form.scope_level === 'institute') payload.college_id = parseInt(form.college_id);
      else payload.battalion_id = parseInt(form.battalion_id);

      await api.registerMentor(payload);
      setSuccess('Registered. An admin must verify your account before you can submit evaluations.');
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ConfigBar />
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
        <div className="page-header">
          <h2>Mentor Registration</h2>
          <p>Requires admin verification before evaluations can be submitted.</p>
        </div>
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />
        <form onSubmit={handleSubmit}>
          <Panel>
            <div className="field-row">
              <Field label="Email" type="email" required value={form.email} onChange={e => update('email', e.target.value)} />
              <Field label="Password" type="password" required value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <Field label="Enrollment number" required value={form.enrollment_number} onChange={e => update('enrollment_number', e.target.value)} />
            <SelectField
              label="Scope level"
              value={form.scope_level}
              onChange={e => update('scope_level', e.target.value)}
              options={[{ value: 'institute', label: 'Institute-level' }, { value: 'multi_college', label: 'Multi-college level' }]}
            />
            {form.scope_level === 'institute' ? (
              <div className="field-row">
                <SelectField
                  label="Battalion"
                  value={form.battalion_id}
                  onChange={e => update('battalion_id', e.target.value)}
                  options={[{ value: '', label: 'Select battalion' }, ...battalions.map(b => ({ value: b.id, label: b.name }))]}
                />
                <SelectField
                  label="College"
                  value={form.college_id}
                  onChange={e => update('college_id', e.target.value)}
                  options={[{ value: '', label: 'Select college' }, ...colleges.map(c => ({ value: c.id, label: c.name }))]}
                />
              </div>
            ) : (
              <SelectField
                label="Battalion"
                value={form.battalion_id}
                onChange={e => update('battalion_id', e.target.value)}
                options={[{ value: '', label: 'Select battalion' }, ...battalions.map(b => ({ value: b.id, label: b.name }))]}
              />
            )}
          </Panel>
          <button className="primary" disabled={busy}>{busy ? 'Registering…' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
}
