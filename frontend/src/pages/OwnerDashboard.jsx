import React, { useEffect, useState } from 'react';
import { getOwnerKpi, addTrainerApi, getCompetitionPosters, createPosterApi, getRevenueAnalyticsApi } from '../services/api';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [posters, setPosters] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form for Owner to Add Trainer ONLY
  const [trainerForm, setTrainerForm] = useState({ full_name: '', phone_number: '', password: '', salary: 15000 });
  const [posterForm, setPosterForm] = useState({ title: '', description: '', organizer_name: '', contact_phone: '', event_date: '' });
  const [posterImage, setPosterImage] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getOwnerKpi();
      setData(res.data);
      const postRes = await getCompetitionPosters();
      setPosters(postRes.data || []);
      
      // Fetch analytics if PLAN_4K
      if (res.data.has_analytics_access) {
        try {
          const analyticsRes = await getRevenueAnalyticsApi();
          setAnalytics(analyticsRes.data);
        } catch (e) {
          console.log('Analytics not available');
        }
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await addTrainerApi(trainerForm);
      setSuccess('✨ Trainer added successfully!');
      setTrainerForm({ full_name: '', phone_number: '', password: '', salary: 15000 });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add trainer. Use a unique phone number!');
    } finally {
      setLoading(false);
    }
  };

  const handlePosterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterImage(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleAddPoster = async (e) => {
    e.preventDefault();
    if (!posterImage) {
      setError('Please select a poster image');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', posterForm.title);
      formData.append('description', posterForm.description);
      formData.append('organizer_name', posterForm.organizer_name);
      formData.append('contact_phone', posterForm.contact_phone);
      formData.append('event_date', posterForm.event_date);
      formData.append('image', posterImage);
      
      await createPosterApi(formData);
      setSuccess('🚀 Competition Poster published live!');
      setPosterForm({ title: '', description: '', organizer_name: '', contact_phone: '', event_date: '' });
      setPosterImage(null);
      setPosterPreview(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish poster');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#38bdf8', fontSize: '20px', fontWeight: 'bold' }}>
      Loading Enterprise SaaS Portal... ⚡
    </div>
  );

  const membersList = data?.members_list || [];
  const trainersList = data?.trainers_list || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <h1>{data.gym_name}</h1>
            <p>
              Gym Code: <span className="inline-code">{data.gym_code}</span> | UPI ID: <span>{data.upi_id}</span>
            </p>
          </div>
          <div className="info-badge">
            <span className="info-label">Active SaaS Tier</span>
            <span className="info-value">{data.plan_type}</span>
          </div>
        </div>

        <div className="status-container">
          {error && <div className="status-message error">⚠️ {error}</div>}
          {success && <div className="status-message success">{success}</div>}
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="label">Total Trainers</span>
            <div className="value">{data.total_trainers || 0}</div>
          </div>
          <div className="stat-card">
            <span className="label">Total Gym Members</span>
            <div className="value" style={{ color: '#34d399' }}>{data.total_members || 0}</div>
          </div>
          <div className="stat-card">
            <span className="label">Estimated Revenue</span>
            <div className="value" style={{ color: '#fbbf24' }}>₹{data.total_revenue || 0}</div>
          </div>
          <div className="stat-card">
            <span className="label">7-Day Inactive Alerts</span>
            <div className="value" style={{ color: '#f87171' }}>{data.inactive_count || 0}</div>
          </div>
        </div>

        <div className="action-grid">
          <div className="panel-card">
            <h3>➕ Hire Gym Trainer</h3>
            <form onSubmit={handleAddTrainer} className="dashboard-form">
              <div className="field">
                <label>Trainer Full Name</label>
                <input className="dashboard-input" type="text" placeholder="e.g. Selva" value={trainerForm.full_name} onChange={(e) => setTrainerForm({ ...trainerForm, full_name: e.target.value })} required />
              </div>
              <div className="field">
                <label>Unique Phone Number</label>
                <input className="dashboard-input" type="text" placeholder="9876543210" value={trainerForm.phone_number} onChange={(e) => setTrainerForm({ ...trainerForm, phone_number: e.target.value })} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input className="dashboard-input" type="password" placeholder="••••••••" value={trainerForm.password} onChange={(e) => setTrainerForm({ ...trainerForm, password: e.target.value })} required />
              </div>
              <div className="field">
                <label>Monthly Salary (₹)</label>
                <input className="dashboard-input" type="number" placeholder="15000" value={trainerForm.salary} onChange={(e) => setTrainerForm({ ...trainerForm, salary: parseFloat(e.target.value) })} required />
              </div>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Register Trainer 🚀'}
              </button>
            </form>
          </div>

          <div className="panel-card">
            <h3>💪 Hired Gym Trainers</h3>
            {trainersList.length === 0 ? (
              <p style={{ color: 'var(--text-soft)' }}>No trainers added yet. Add your first trainer using the form!</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Trainer Name</th>
                      <th>Phone</th>
                      <th>Monthly Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainersList.map((t) => (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--primary-strong)', fontWeight: 700 }}>{t.name}</td>
                        <td style={{ color: 'var(--text-soft)' }}>{t.phone}</td>
                        <td style={{ color: '#34d399', fontWeight: 800 }}>₹{t.salary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Competition Poster Publishing */}
        <div className="dashboard-section">
          <h3>🏆 Publish Competition Poster</h3>
          <form onSubmit={handleAddPoster} className="dashboard-form" style={{ maxWidth: '600px' }}>
            <div className="field">
              <label>Poster Title</label>
              <input className="dashboard-input" type="text" placeholder="e.g. State Bodybuilding Championship 2025" value={posterForm.title} onChange={(e) => setPosterForm({ ...posterForm, title: e.target.value })} required />
            </div>
            <div className="field">
              <label>Organizer Name</label>
              <input className="dashboard-input" type="text" placeholder="e.g. Tamil Nadu Bodybuilding Association" value={posterForm.organizer_name} onChange={(e) => setPosterForm({ ...posterForm, organizer_name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Contact Phone</label>
              <input className="dashboard-input" type="text" placeholder="e.g. 9876543210" value={posterForm.contact_phone} onChange={(e) => setPosterForm({ ...posterForm, contact_phone: e.target.value })} required />
            </div>
            <div className="field">
              <label>Event Date (optional)</label>
              <input className="dashboard-input" type="date" value={posterForm.event_date} onChange={(e) => setPosterForm({ ...posterForm, event_date: e.target.value })} />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="dashboard-textarea" placeholder="Event details, categories, prizes, registration info..." value={posterForm.description} onChange={(e) => setPosterForm({ ...posterForm, description: e.target.value })} rows={3} />
            </div>
            <div className="field">
              <label>Poster Image (JPG, PNG, WebP)</label>
              <input className="dashboard-input" type="file" accept="image/*" onChange={handlePosterImageChange} required />
              {posterPreview && (
                <div style={{ marginTop: '10px' }}>
                  <img src={posterPreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              )}
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Poster 🚀'}
            </button>
          </form>
        </div>

        <div className="dashboard-section">
          <h3>📋 Gym Members List (Added by Trainers)</h3>
          {membersList.length === 0 ? (
            <p style={{ color: 'var(--text-soft)' }}>No members registered yet. Members will appear here once trainers enroll them.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table member-table">
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Phone</th>
                    <th>Category</th>
                    <th>Fee Paid Status</th>
                  </tr>
                </thead>
                <tbody>
                  {membersList.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700 }}>{m.name}</td>
                      <td style={{ color: 'var(--text-soft)' }}>{m.phone}</td>
                      <td><span className="category-pill">{m.category}</span></td>
                      <td>
                        <span className={m.fee_paid ? 'status-success' : 'status-danger'}>
                          {m.fee_paid ? '🟢 Paid' : '🔴 Due'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h3>📋 Gym Members List (Added by Trainers)</h3>
            <h3 style={{ color: '#ec4899' }}>📊 Revenue & Financial Analytics</h3>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="label">Total Members</span>
                <div className="value">{analytics.total_members}</div>
              </div>
              <div className="stat-card">
                <span className="label">Paid / Unpaid</span>
                <div className="value" style={{ color: '#34d399' }}>{analytics.paid_members} / {analytics.unpaid_members}</div>
              </div>
              <div className="stat-card">
                <span className="label">Total Due</span>
                <div className="value" style={{ color: '#f87171' }}>₹{analytics.total_due_amount}</div>
              </div>
              <div className="stat-card">
                <span className="label">Monthly Revenue</span>
                <div className="value" style={{ color: '#fbbf24' }}>₹{analytics.estimated_monthly_revenue}</div>
              </div>
              <div className="stat-card">
                <span className="label">Trainer Salaries</span>
                <div className="value" style={{ color: '#f87171' }}>₹{analytics.total_trainer_salary}</div>
              </div>
              <div className="stat-card">
                <span className="label">Est. Net Profit</span>
                <div className="value" style={{ color: '#34d399' }}>₹{analytics.estimated_net_profit}</div>
              </div>
              <div className="stat-card">
                <span className="label">30-Day Attendance</span>
                <div className="value" style={{ color: '#38bdf8' }}>{analytics.attendance_30_days}</div>
              </div>
              <div className="stat-card">
                <span className="label">Trainers</span>
                <div className="value">{analytics.trainer_count}</div>
              </div>
</div>

        {/* Revenue & Financial Analytics Dashboard - PLAN_4K - DISABLED FOR BUILD */}
      </div>
    </div>
  );
};

export default OwnerDashboard;