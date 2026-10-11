import React, { useEffect, useState } from 'react';
import { getTrainerDashboardApi, trainerAddMemberApi, createWorkoutApi, sendMessageApi } from '../services/api';

const TrainerDashboard = () => {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forms
  const [memberForm, setMemberForm] = useState({ full_name: '', phone_number: '', password: '', category: 'GENERAL_FITNESS', custom_monthly_gym_fee: 1000 });
  const [workoutForm, setWorkoutForm] = useState({ category: 'GENERAL_FITNESS', title: '', description: '' });
  const [chatForm, setChatForm] = useState({ receiver_id: '', message: '' });

  const fetchTrainer = async () => {
    try {
      const res = await getTrainerDashboardApi();
      setData(res.data);
    } catch (err) {
      setError('Failed to load Trainer Dashboard');
    }
  };

  useEffect(() => {
    fetchTrainer();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      await trainerAddMemberApi(memberForm);
      setMsg('✨ Member enrolled successfully!');
      setMemberForm({ full_name: '', phone_number: '', password: '', category: 'GENERAL_FITNESS', custom_monthly_gym_fee: 1000 });
      fetchTrainer();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add member. Unique phone number required!');
    } finally { setLoading(false); }
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await createWorkoutApi(workoutForm);
      setMsg('✨ Workout & Diet Slot Plan Published!');
      setWorkoutForm({ category: 'GENERAL_FITNESS', title: '', description: '' });
    } catch (err) {
      setError('Failed to publish plan');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await sendMessageApi({ receiver_id: parseInt(chatForm.receiver_id), message: chatForm.message });
      setMsg('💬 Direct message sent to member!');
      setChatForm({ receiver_id: '', message: '' });
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (!data) return (
    <div style={{ minHeight: '90vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '20px', fontWeight: 'bold' }}>
      Loading Trainer SaaS Portal... ⚡
    </div>
  );

  const assignedMembers = data.assigned_members || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <h1>Trainer Dashboard: {data.trainer_name}</h1>
            <p>Manage Trainees, Workouts, Diet Charts & Internal Communication</p>
          </div>
          <div className="info-badge">
            <span className="info-label">Monthly Stipend</span>
            <span className="info-value" style={{ color: '#34d399' }}>₹{data.salary}</span>
          </div>
        </div>

        {msg && <div className="status-message success">{msg}</div>}
        {error && <div className="status-message error">⚠️ {error}</div>}

        <div className="action-grid">
          <div className="panel-card">
            <h3 style={{ color: '#34d399' }}>🏋️ Enroll New Trainee</h3>
            <form onSubmit={handleAddMember} className="dashboard-form">
              <input className="dashboard-input" type="text" placeholder="Member Full Name" value={memberForm.full_name} onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })} required />
              <input className="dashboard-input" type="text" placeholder="Unique Phone Number" value={memberForm.phone_number} onChange={(e) => setMemberForm({ ...memberForm, phone_number: e.target.value })} required />
              <input className="dashboard-input" type="password" placeholder="Password" value={memberForm.password} onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })} required />
              <select className="dashboard-select" value={memberForm.category} onChange={(e) => setMemberForm({ ...memberForm, category: e.target.value })}>
                <option value="GENERAL_FITNESS">General Fitness</option>
                <option value="BODYBUILDER">Bodybuilding</option>
                <option value="WEIGHT_LOSS">Weight Loss</option>
                <option value="FAT_LOSS">Fat Loss</option>
                <option value="MUSCLE_GAIN">Muscle Gain</option>
              </select>
              <input className="dashboard-input" type="number" placeholder="Monthly Fee (₹)" value={memberForm.custom_monthly_gym_fee} onChange={(e) => setMemberForm({ ...memberForm, custom_monthly_gym_fee: parseFloat(e.target.value) })} required />
              <button type="submit" className="primary-btn" style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }} disabled={loading}>
                {loading ? 'Enrolling...' : 'Enroll Trainee 🚀'}
              </button>
            </form>
          </div>

          <div className="panel-card">
            <h3 style={{ color: '#38bdf8' }}>🥗 Publish Workout & Diet Slot</h3>
            <form onSubmit={handleCreateWorkout} className="dashboard-form">
              <select className="dashboard-select" value={workoutForm.category} onChange={(e) => setWorkoutForm({ ...workoutForm, category: e.target.value })}>
                <option value="GENERAL_FITNESS">General Fitness Category</option>
                <option value="BODYBUILDER">Bodybuilding Category</option>
                <option value="WEIGHT_LOSS">Weight Loss Category</option>
                <option value="FAT_LOSS">Fat Loss Category</option>
                <option value="MUSCLE_GAIN">Muscle Gain Category</option>
              </select>
              <input className="dashboard-input" type="text" placeholder="Title (e.g. Hypertrophy + High Protein Diet)" value={workoutForm.title} onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })} required />
              <textarea className="dashboard-textarea" placeholder="Write exercises, sets, reps, and diet plan timing..." value={workoutForm.description} onChange={(e) => setWorkoutForm({ ...workoutForm, description: e.target.value })} required />
              <button type="submit" className="primary-btn" style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>
                Publish Workout & Diet 📝
              </button>
            </form>
          </div>
        </div>

        <div className="two-panel-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="panel-card">
            <h3>📋 Supervised Trainees Directory ({assignedMembers.length})</h3>
            {assignedMembers.length === 0 ? <p style={{ color: 'var(--text-soft)' }}>No trainees assigned yet.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Fee Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedMembers.map((m) => (
                      <tr key={m.id}>
                        <td style={{ color: 'var(--primary-strong)', fontWeight: 800 }}>#{m.id}</td>
                        <td style={{ fontWeight: 700 }}>{m.name}</td>
                        <td style={{ color: 'var(--text-soft)' }}>{m.phone}</td>
                        <td><span className="category-pill">{m.category}</span></td>
                        <td style={{ fontWeight: 800, color: m.fee_paid ? '#34d399' : '#f87171' }}>{m.fee_paid ? 'Paid' : 'Due'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel-card">
            <h3 style={{ color: '#fbbf24' }}>💬 Send Direct Msg</h3>
            <form onSubmit={handleSendMessage} className="dashboard-form">
              <select className="dashboard-select" value={chatForm.receiver_id} onChange={(e) => setChatForm({ ...chatForm, receiver_id: e.target.value })} required>
                <option value="">Select Trainee Member</option>
                {assignedMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (#{m.id})</option>
                ))}
              </select>
              <textarea className="dashboard-textarea" placeholder="Type message or instruction..." value={chatForm.message} onChange={(e) => setChatForm({ ...chatForm, message: e.target.value })} required />
              <button type="submit" className="primary-btn" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                Send Message 📩
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;