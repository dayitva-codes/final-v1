import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Field, SelectField, Panel, ErrorBanner, SuccessBanner } from '../components/Form';
import ConfigBar from '../components/ConfigBar';

const WINGS_BY_GENDER = {
  female: [{ value: 'JW', label: 'JW — Junior Wing' }, { value: 'SW', label: 'SW — Senior Wing' }],
  male: [{ value: 'JD', label: 'JD — Junior Division' }, { value: 'SD', label: 'SD — Senior Division' }],
};

export default function RegisterCadet() {
  const navigate = useNavigate();
  const [battalions, setBattalions] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', battalion_id: '', college_id: '',
    full_name: '', enrollment_number: '', mobile: '', academic_year: '',
    address: '', gender: 'female', wing: 'JW', ncc_goal: '',
  });

  useEffect(() => {
    api.listBattalions().then(setBattalions).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.battalion_id) {
      api.listColleges(form.battalion_id).then(setColleges).catch(() => {});
    } else {
      setColleges([]);
    }
  }, [form.battalion_id]);

  function update(key, value) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'gender') next.wing = WINGS_BY_GENDER[value][0].value;
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setBusy(true);
    try {
      await api.registerCadet({
        ...form,
        battalion_id: parseInt(form.battalion_id),
        college_id: parseInt(form.college_id),
        academic_year: parseInt(form.academic_year),
      });
      setSuccess('Registered. You can now sign in from the login page.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ConfigBar />
      <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 16px' }}>
        <div className="page-header">
          <h2>Cadet Registration</h2>
          <p>Battalion and college placement, followed by personal details.</p>
        </div>
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />
        <form onSubmit={handleSubmit}>
          <Panel title="Account">
            <div className="field-row">
              <Field label="Email" type="email" required value={form.email} onChange={e => update('email', e.target.value)} />
              <Field label="Password" type="password" required value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
          </Panel>

          <Panel title="Battalion & College">
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
            <div className="field-row">
              <SelectField
                label="Gender"
                value={form.gender}
                onChange={e => update('gender', e.target.value)}
                options={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]}
              />
              <SelectField
                label="Wing / Division"
                value={form.wing}
                onChange={e => update('wing', e.target.value)}
                options={WINGS_BY_GENDER[form.gender]}
              />
            </div>
          </Panel>

          <Panel title="Personal details">
            <div className="field-row">
              <Field label="Full name" required value={form.full_name} onChange={e => update('full_name', e.target.value)} />
              <Field label="Enrollment number" required value={form.enrollment_number} onChange={e => update('enrollment_number', e.target.value)} />
            </div>
            <div className="field-row">
              <Field label="Mobile" required value={form.mobile} onChange={e => update('mobile', e.target.value)} />
              <Field label="Academic year (1-4)" type="number" required value={form.academic_year} onChange={e => update('academic_year', e.target.value)} />
            </div>
            <Field label="Address" value={form.address} onChange={e => update('address', e.target.value)} />
            <Field label="NCC goal" value={form.ncc_goal} onChange={e => update('ncc_goal', e.target.value)} />
          </Panel>

          <button className="primary" disabled={busy}>{busy ? 'Registering…' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
}
