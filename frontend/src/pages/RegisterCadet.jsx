import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Field, SelectField, Panel, ErrorBanner, SuccessBanner, TagGuide, PasswordStrengthMeter } from '../components/Form';
import ConfigBar from '../components/ConfigBar';

const WINGS_BY_GENDER = {
  female: [
    { value: 'JW', label: 'JW — Junior Wing (School / Class 8-10)', desc: 'Female Junior Category' },
    { value: 'SW', label: 'SW — Senior Wing (College / Degree)', desc: 'Female Senior Category' },
  ],
  male: [
    { value: 'JD', label: 'JD — Junior Division (School / Class 8-10)', desc: 'Male Junior Category' },
    { value: 'SD', label: 'SD — Senior Division (College / Degree)', desc: 'Male Senior Category' },
  ],
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
    full_name: '', enrollment_number: '', mobile: '', academic_year: '2',
    address: '', gender: 'female', wing: 'SW', ncc_goal: '',
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
      if (key === 'gender') {
        next.wing = WINGS_BY_GENDER[value][1]?.value || WINGS_BY_GENDER[value][0].value;
      }
      return next;
    });
  }

  function autoFillSample() {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setForm({
      email: `cadet_${randomId}@ncc.local`,
      password: 'CadetPassword123!',
      battalion_id: battalions[0]?.id ? String(battalions[0].id) : '1',
      college_id: colleges[0]?.id ? String(colleges[0].id) : '1',
      full_name: 'Priya Sharma',
      enrollment_number: `MP24SWG${randomId}`,
      mobile: '9876543210',
      academic_year: '2',
      address: 'Hostel Block B, Govt Girls Campus',
      gender: 'female',
      wing: 'SW',
      ncc_goal: 'Aiming for Republic Day Camp (RDC) & Best Cadet Trophy',
    });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Strict Validation Limitation Rules
    if (form.password.length < 8) {
      setError('⚠️ Security Rule Violation: Password must be at least 8 characters long.');
      return;
    }

    const cleanMobile = form.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('⚠️ Mobile Rule Violation: Mobile number must be exactly 10 digits.');
      return;
    }

    if (!form.battalion_id) {
      setError('⚠️ Please select a Battalion.');
      return;
    }

    if (!form.college_id) {
      setError('⚠️ Please select a College under the selected Battalion.');
      return;
    }

    const acadYear = parseInt(form.academic_year);
    if (isNaN(acadYear) || acadYear < 1 || acadYear > 4) {
      setError('⚠️ Academic Year Rule Violation: Must be between 1 and 4.');
      return;
    }

    setBusy(true);
    try {
      await api.registerCadet({
        ...form,
        mobile: cleanMobile,
        battalion_id: parseInt(form.battalion_id),
        college_id: parseInt(form.college_id),
        academic_year: acadYear,
      });
      setSuccess('Cadet registered successfully! Redirecting to login...');
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
      <div style={{ maxWidth: 680, margin: '36px auto', padding: '0 16px' }}>
        <div className="page-header">
          <div className="eyebrow">
            <span className="live-pulse"></span>
            <span>CADET ENROLLMENT PORTAL</span>
          </div>
          <h2>Cadet Registration</h2>
          <p>Register as an active cadet to receive mentor evaluations, leaderboard ranking, and AI insights.</p>
        </div>

        <div className="quick-fill-bar">
          <span style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>⚡ FAST TESTING:</span>
          <button type="button" className="quick-fill-btn" onClick={autoFillSample}>
            Fill Sample Cadet Details
          </button>
        </div>

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <form onSubmit={handleSubmit}>
          <Panel title="1. Account Credentials" guideTag="RULE: MIN 8 CHARS">
            <div className="field-row">
              <Field
                label="Cadet Email"
                type="email"
                required
                placeholder="cadet@college.edu"
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

          <Panel title="2. Battalion Placement & Wing Matrix" guideTag="NCC WING MATRIX ENFORCED">
            <TagGuide title="NCC Wing & Division Limitation Rule" badge="STRICT COMPLIANCE">
              • <strong>Female Cadets</strong>: Eligible exclusively for <strong>JW (Junior Wing)</strong> or <strong>SW (Senior Wing)</strong>.<br/>
              • <strong>Male Cadets</strong>: Eligible exclusively for <strong>JD (Junior Division)</strong> or <strong>SD (Senior Division)</strong>.<br/>
              • The system dynamically enforces this to prevent invalid military unit records.
            </TagGuide>

            <div className="field-row">
              <SelectField
                label="Battalion"
                required
                guideTag="PARENT UNIT"
                value={form.battalion_id}
                onChange={e => update('battalion_id', e.target.value)}
                options={[{ value: '', label: '— Select Battalion —' }, ...battalions.map(b => ({ value: b.id, label: `${b.name} (${b.code})` }))]}
              />
              <SelectField
                label="College / Institute"
                required
                guideTag="ATTACHED UNIT"
                value={form.college_id}
                onChange={e => update('college_id', e.target.value)}
                options={[{ value: '', label: form.battalion_id ? '— Select College —' : '— Choose Battalion First —' }, ...colleges.map(c => ({ value: c.id, label: c.name }))]}
              />
            </div>

            <div className="field-row">
              <SelectField
                label="Cadet Gender"
                required
                value={form.gender}
                onChange={e => update('gender', e.target.value)}
                options={[
                  { value: 'female', label: 'Female (Eligible for JW / SW)' },
                  { value: 'male', label: 'Male (Eligible for JD / SD)' },
                ]}
              />
              <SelectField
                label="Wing / Division Category"
                required
                badge="VALIDATED"
                value={form.wing}
                onChange={e => update('wing', e.target.value)}
                options={WINGS_BY_GENDER[form.gender]}
              />
            </div>
          </Panel>

          <Panel title="3. Cadet Dossier & Contact Info" guideTag="RULE: 10 DIGIT MOBILE">
            <div className="field-row">
              <Field
                label="Full Cadet Name"
                required
                placeholder="e.g. Priya Sharma"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
              />
              <Field
                label="Enrollment Number"
                required
                hint="e.g. MP24SWG0001"
                placeholder="State + Year + Wing + Number"
                value={form.enrollment_number}
                onChange={e => update('enrollment_number', e.target.value.toUpperCase())}
              />
            </div>

            <div className="field-row">
              <Field
                label="Mobile Contact"
                required
                hint={`${form.mobile.replace(/\D/g, '').length}/10 digits`}
                limitRule="Exactly 10 numeric digits"
                placeholder="10-digit number"
                value={form.mobile}
                onChange={e => update('mobile', e.target.value)}
              />
              <Field
                label="Academic Year"
                type="number"
                min="1"
                max="4"
                required
                limitRule="1 (1st Year) to 4 (4th Year)"
                value={form.academic_year}
                onChange={e => update('academic_year', e.target.value)}
              />
            </div>

            <Field
              label="Campus Address / Base"
              placeholder="Hostel, Street or Base Location"
              value={form.address}
              onChange={e => update('address', e.target.value)}
            />

            <Field
              label="Primary NCC Target / Goal"
              placeholder="e.g. RDC Camp selection, C-Certificate Alpha Grade, Best Cadet"
              value={form.ncc_goal}
              onChange={e => update('ncc_goal', e.target.value)}
            />
          </Panel>

          <button className="primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'REGISTERING CADET DOSSIER…' : '⚡ COMPLETE CADET ENROLLMENT'}
          </button>
        </form>
      </div>
    </div>
  );
}
