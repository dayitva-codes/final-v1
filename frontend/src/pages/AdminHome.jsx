import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Field, Panel, ErrorBanner, SuccessBanner } from '../components/Form';

export default function AdminHome() {
  const [battalions, setBattalions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [battForm, setBattForm] = useState({ name: '', code: '' });
  const [collForm, setCollForm] = useState({ battalion_id: '', name: '', academic_year_start: '' });
  const [verifyUserId, setVerifyUserId] = useState('');

  function refreshBattalions() {
    api.listBattalions().then(setBattalions).catch(() => {});
  }
  useEffect(refreshBattalions, []);

  async function createBattalion(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.createBattalion(battForm);
      setSuccess(`Battalion "${battForm.name}" created.`);
      setBattForm({ name: '', code: '' });
      refreshBattalions();
    } catch (err) { setError(err.message); }
  }

  async function createCollege(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.createCollege({
        ...collForm,
        battalion_id: parseInt(collForm.battalion_id),
        academic_year_start: parseInt(collForm.academic_year_start),
      });
      setSuccess(`College "${collForm.name}" created.`);
      setCollForm({ battalion_id: '', name: '', academic_year_start: '' });
    } catch (err) { setError(err.message); }
  }

  async function verifyMentor(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.verifyMentor(verifyUserId);
      setSuccess(`Mentor (user id ${verifyUserId}) verified.`);
      setVerifyUserId('');
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Command Setup</h2>
        <p>Establish battalions and colleges, and clear mentors for evaluation duty.</p>
      </div>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Panel title="Register a Battalion">
        <form onSubmit={createBattalion}>
          <div className="field-row">
            <Field label="Name" required value={battForm.name} onChange={e => setBattForm({ ...battForm, name: e.target.value })} />
            <Field label="Code" required value={battForm.code} onChange={e => setBattForm({ ...battForm, code: e.target.value })} />
          </div>
          <button className="primary">Create Battalion</button>
        </form>
      </Panel>

      <Panel title="Register a College">
        <form onSubmit={createCollege}>
          <div className="field-row">
            <div className="field">
              <label>Battalion</label>
              <select value={collForm.battalion_id} onChange={e => setCollForm({ ...collForm, battalion_id: e.target.value })} required>
                <option value="">Select battalion</option>
                {battalions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <Field label="College name" required value={collForm.name} onChange={e => setCollForm({ ...collForm, name: e.target.value })} />
            <Field label="Academic year start" type="number" required value={collForm.academic_year_start} onChange={e => setCollForm({ ...collForm, academic_year_start: e.target.value })} />
          </div>
          <button className="primary">Create College</button>
        </form>
      </Panel>

      <Panel title="Verify a Mentor">
        <form onSubmit={verifyMentor}>
          <Field label="Mentor's user ID" required value={verifyUserId} onChange={e => setVerifyUserId(e.target.value)} />
          <button className="primary">Verify Mentor</button>
        </form>
      </Panel>

      <Panel title="Battalions on record">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Code</th></tr></thead>
          <tbody>
            {battalions.map(b => (
              <tr key={b.id}><td>{b.id}</td><td>{b.name}</td><td>{b.code}</td></tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
