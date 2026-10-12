import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../services/api';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginApi({
        phone_number: phoneNumber,
        password: password,
      });

      const data = response.data;
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user_id', String(data.user_id ?? ''));
      localStorage.setItem('full_name', data.full_name || 'User');

      const role = data.role;
      if (role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (role === 'OWNER') {
        navigate('/owner');
      } else if (role === 'TRAINER') {
        navigate('/trainer');
      } else if (role === 'MEMBER') {
        navigate('/member');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Invalid phone number or password, or server offline!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell auth-shell">
      <div className="auth-panel">
        <div className="brand-block">
          <div className="brand-mark">GS</div>
          <div>
            <h2>GymSoft SaaS Portal</h2>
            <p>Welcome back! Login to your account</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-field">
            <label>Phone Number</label>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. 9999999999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="premium-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login to Dashboard 🚀'}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have a Gym account?{' '}
          <span onClick={() => navigate('/register')}>Register Gym</span>
        </p>
      </div>
    </div>
  );
};

export default Login;