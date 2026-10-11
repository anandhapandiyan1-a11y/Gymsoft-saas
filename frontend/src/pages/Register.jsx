import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    role: 'OWNER',
    gym_name: '',
    city: '',
    address: '',
    upi_id: '',
    plan_type: 'PLAN_2K',
    upi_ref_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const planDetails = {
    PLAN_2K: {
      title: 'PLAN 2K (Starter Tier)',
      price: '₹2,000 / month',
      features: ['Unlimited Gym Members', 'Basic Attendance Tracking', 'GPay / PhonePe UPI Direct Integration', '2-Day Free Trial Included']
    },
    PLAN_3K: {
      title: 'PLAN 3K (Growth Tier)',
      price: '₹3,000 / month',
      features: ['Unlimited Gym Members', 'Built-in BMI Calculator for Members', 'Attendance Tracking & Reports', 'Priority Support']
    },
    PLAN_4K: {
      title: 'PLAN 4K (Pro Enterprise Tier)',
      price: '₹4,000 / month',
      features: ['Unlimited Gym Members & Trainers', 'Advanced Weight Progression & Lift Tracking', 'Detailed Revenue & Financial Analytics Dashboard', 'Dedicated VIP Support']
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/auth/register', formData);

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('user_id', String(res.data.user_id ?? ''));
      localStorage.setItem('full_name', res.data.full_name);

      navigate('/owner');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a unique phone number!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell auth-shell">
      <div className="auth-panel register-panel">
        <div className="brand-block centered-block">
          <div className="brand-mark">GS</div>
          <div>
            <h2>GymSoft SaaS Enterprise</h2>
            <p>Launch your digital gym management empire today</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <div className="form-field">
              <label>Owner Full Name</label>
              <input className="auth-input" type="text" placeholder="Anandha Pandiyan" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Phone Number</label>
              <input className="auth-input" type="text" placeholder="9876543210" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} required />
            </div>
          </div>

          <div className="field-grid">
            <div className="form-field">
              <label>Password</label>
              <input className="auth-input" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Gym Name</label>
              <input className="auth-input" type="text" placeholder="Titan Fitness" value={formData.gym_name} onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })} required />
            </div>
          </div>

          <div className="field-grid">
            <div className="form-field">
              <label>City</label>
              <input className="auth-input" type="text" placeholder="Rajapalayam" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>GPay / PhonePe UPI ID</label>
              <input className="auth-input" type="text" placeholder="gym@okaxis" value={formData.upi_id} onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })} required />
            </div>
          </div>

          <div className="form-field">
            <label>Choose SaaS Tier Plan</label>
            <select className="auth-input" value={formData.plan_type} onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}>
              <option value="PLAN_2K">PLAN 2K - Starter (₹2,000/mo) - Unlimited Members</option>
              <option value="PLAN_3K">PLAN 3K - Growth (₹3,000/mo) - + BMI Calculator</option>
              <option value="PLAN_4K">PLAN 4K - Pro Enterprise (₹4,000/mo) - + Weight Progression & Revenue Analytics</option>
            </select>
          </div>

          <div className="plan-highlight">
            <div className="plan-header">
              <span className="plan-title">{planDetails[formData.plan_type].title}</span>
              <span className="plan-price">{planDetails[formData.plan_type].price}</span>
            </div>
            <ul>
              {planDetails[formData.plan_type].features.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          </div>

          <div className="verification-box">
            <span>💳 Instant GPay / UPI Payment Verification</span>
            <p>
              Scan & Pay {planDetails[formData.plan_type].price} via GPay / PhonePe to <b>gymsoft@okaxis</b> and enter your UTR/Reference ID below:
            </p>
            <input
              className="auth-input small-input"
              type="text"
              placeholder="Enter UPI Transaction Reference (UTR) ID"
              value={formData.upi_ref_id}
              onChange={(e) => setFormData({ ...formData, upi_ref_id: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="premium-btn" disabled={loading}>
            {loading ? 'Setting up your SaaS Portal...' : 'Start 2-Day Free Trial & Launch 🚀'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <span onClick={() => navigate('/login')}>Login to Dashboard</span>
        </p>
      </div>
    </div>
  );
};

export default Register;