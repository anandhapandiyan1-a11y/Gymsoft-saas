import React, { useEffect, useState } from 'react';
import { getMemberDashboardApi, markAttendanceApi, submitFeedbackApi, changePasswordApi } from '../services/api';

const MemberDashboard = () => {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  // Password & Feedback State
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [passMsg, setPassMsg] = useState('');

  // BMI Calculator State (PLAN_3K, PLAN_4K)
  const [bmiForm, setBmiForm] = useState({ height_cm: '', weight_kg: '' });
  const [bmiResult, setBmiResult] = useState(null);

  // Weight Progression State (PLAN_4K)
  const [weightLog, setWeightLog] = useState({ weight_kg: '', notes: '' });
  const [weightHistory, setWeightHistory] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await getMemberDashboardApi();
      setData(res.data);
      // Fetch weight history for PLAN_4K
      if (res.data.gym_info?.has_progression_access) {
        const historyRes = await fetch('/member/weight-history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setWeightHistory(historyData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAttendance = async () => {
    try {
      const res = await markAttendanceApi();
      setMessage(res.data.message);
      fetchDashboard();
    } catch (err) {
      setMessage('Attendance error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await changePasswordApi(passForm);
      setPassMsg('✨ Password updated successfully!');
      setPassForm({ old_password: '', new_password: '' });
    } catch (err) {
      setPassMsg('⚠️ Failed to update password.');
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await submitFeedbackApi(feedbackForm);
      setMessage('✨ Feedback sent to Gym Owner!');
      setFeedbackForm({ rating: 5, comment: '' });
    } catch (err) {
      setMessage('⚠️ Feedback failed.');
    }
  };

  const calculateBMI = () => {
    const h = parseFloat(bmiForm.height_cm) / 100;
    const w = parseFloat(bmiForm.weight_kg);
    if (h > 0 && w > 0) {
      const bmi = (w / (h * h)).toFixed(1);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      setBmiResult({ bmi, category });
    }
  };

  const handleWeightLog = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/member/weight-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(weightLog)
      });
      if (res.ok) {
        setMessage('✨ Weight logged successfully!');
        setWeightLog({ weight_kg: '', notes: '' });
        fetchDashboard();
      } else {
        setMessage('⚠️ Failed to log weight');
      }
    } catch (err) {
      setMessage('⚠️ Weight log error');
    }
  };

  if (!data) return <div className="loading-screen">Loading Member Portal...</div>;

  const { member, gym_info, workout_plan } = data;
  const hasBmiAccess = gym_info?.has_bmi_access;
  const hasProgressionAccess = gym_info?.has_progression_access;

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell" style={{ maxWidth: '1000px' }}>
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {member.name}</h1>
            <p>Gym: {gym_info.gym_name} | Goal: <b style={{ color: '#34d399' }}>{member.category}</b></p>
          </div>
          <button onClick={handleAttendance} className="primary-btn" style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}>
            Mark Attendance 📍
          </button>
        </div>

        {message && <div className="status-message success">{message}</div>}

        <div className="dashboard-section">
          <h3>Membership Status</h3>
          <p>Monthly Fee: <b>₹{member.fee_amount}</b></p>
          <p>Payment: <span className={member.fee_paid ? 'status-success' : 'status-danger'}>{member.fee_paid ? 'Paid' : 'Due'}</span></p>

          {!member.fee_paid && gym_info.upi_id !== 'N/A' && (
            <a href={`upi://pay?pa=${gym_info.upi_id}&pn=GymSoft&am=${member.fee_amount}&cu=INR`} className="primary-btn" style={{ display: 'inline-block', width: 'auto', marginTop: '12px' }}>
              Pay ₹{member.fee_amount} via UPI App (GPay/PhonePe)
            </a>
          )}
        </div>

        {workout_plan && (
          <div className="dashboard-section" style={{ borderColor: 'rgba(94, 234, 212, 0.35)' }}>
            <h3 style={{ color: '#38bdf8' }}>🏋️ Workout Plan: {workout_plan.title}</h3>
            <p style={{ color: 'var(--text-soft)', lineHeight: 1.7 }}>{workout_plan.description}</p>
          </div>
        )}

        {/* BMI Calculator - PLAN_3K & PLAN_4K */}
        {hasBmiAccess && (
          <div className="dashboard-section" style={{ borderColor: 'rgba(251, 191, 36, 0.35)' }}>
            <h3 style={{ color: '#fbbf24' }}>⚖️ BMI Calculator</h3>
            <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="panel-card">
                <form onSubmit={(e) => { e.preventDefault(); calculateBMI(); }} className="dashboard-form">
                  <div className="field">
                    <label>Height (cm)</label>
                    <input className="dashboard-input" type="number" placeholder="170" value={bmiForm.height_cm} onChange={(e) => setBmiForm({ ...bmiForm, height_cm: e.target.value })} required min="50" max="250" step="0.5" />
                  </div>
                  <div className="field">
                    <label>Weight (kg)</label>
                    <input className="dashboard-input" type="number" placeholder="70" value={bmiForm.weight_kg} onChange={(e) => setBmiForm({ ...bmiForm, weight_kg: e.target.value })} required min="20" max="300" step="0.1" />
                  </div>
                  <button type="submit" className="primary-btn" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                    Calculate BMI
                  </button>
                </form>
              </div>
              {bmiResult && (
                <div className="panel-card" style={{ background: 'linear-gradient(135deg, #1e3a2b 0%, #0f172a 100%)', borderColor: '#34d399' }}>
                  <h4 style={{ color: '#34d399', marginTop: 0 }}>Your BMI: {bmiResult.bmi}</h4>
                  <p style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>{bmiResult.category}</p>
                  <p style={{ color: 'var(--text-soft)', fontSize: '13px' }}>
                    {bmiResult.category === 'Normal' ? '✅ Healthy weight range!' : 
                     bmiResult.category === 'Underweight' ? '📈 Consider gaining weight with strength training' :
                     bmiResult.category === 'Overweight' ? '🔥 Focus on cardio & calorie deficit' :
                     '⚠️ Consult a trainer for personalized plan'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weight Progression Tracking - PLAN_4K */}
        {hasProgressionAccess && (
          <div className="dashboard-section" style={{ borderColor: 'rgba(139, 92, 246, 0.35)' }}>
            <h3 style={{ color: '#8b5cf6' }}>📈 Weight Progression & Lift Tracking</h3>
            <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="panel-card">
                <form onSubmit={handleWeightLog} className="dashboard-form">
                  <div className="field">
                    <label>Current Weight (kg)</label>
                    <input className="dashboard-input" type="number" placeholder="70.5" value={weightLog.weight_kg} onChange={(e) => setWeightLog({ ...weightLog, weight_kg: e.target.value })} required min="20" max="300" step="0.1" />
                  </div>
                  <div className="field">
                    <label>Notes (optional)</label>
                    <input className="dashboard-input" type="text" placeholder="e.g. Post-workout, morning weigh-in" value={weightLog.notes} onChange={(e) => setWeightLog({ ...weightLog, notes: e.target.value })} />
                  </div>
                  <button type="submit" className="primary-btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    Log Weight
                  </button>
                </form>
              </div>
              <div className="panel-card">
                <h4 style={{ color: '#8b5cf6', marginTop: 0 }}>Weight History</h4>
                {weightHistory.length === 0 ? (
                  <p style={{ color: 'var(--text-soft)' }}>No weight logs yet. Start tracking your progress!</p>
                ) : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="dashboard-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Weight (kg)</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weightHistory.slice().reverse().map((log, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td>{new Date(log.created_at).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 700, color: '#8b5cf6' }}>{log.weight_kg}</td>
                            <td style={{ color: 'var(--text-soft)' }}>{log.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="panel-card">
            <h3 style={{ color: '#fbbf24' }}>⭐ Submit Gym Feedback</h3>
            <form onSubmit={handleFeedback} className="dashboard-form">
              <div className="field">
                <label>Rating (1-5 Stars)</label>
                <select className="dashboard-select" value={feedbackForm.rating} onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}>
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                </select>
              </div>
              <div className="field">
                <label>Comment</label>
                <textarea className="dashboard-textarea" placeholder="Write feedback for owner..." value={feedbackForm.comment} onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} required />
              </div>
              <button type="submit" className="primary-btn" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                Submit Feedback
              </button>
            </form>
          </div>

          <div className="panel-card">
            <h3 style={{ color: '#38bdf8' }}>🔒 Change Password</h3>
            {passMsg && <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '12px' }}>{passMsg}</div>}
            <form onSubmit={handlePasswordChange} className="dashboard-form">
              <input className="dashboard-input" type="password" placeholder="Current Password" value={passForm.old_password} onChange={(e) => setPassForm({ ...passForm, old_password: e.target.value })} required />
              <input className="dashboard-input" type="password" placeholder="New Password" value={passForm.new_password} onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })} required />
              <button type="submit" className="primary-btn" style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;