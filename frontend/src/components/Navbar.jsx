import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('full_name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="premium-nav">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <span className="brand-icon">GS</span>
        GymSoft SaaS
      </div>

      {role ? (
        <div className="nav-actions">
          <span className="nav-user-pill">
            Welcome, <strong>{name}</strong> <span className="role-tag">{role}</span>
          </span>
          <button className="nav-button danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="nav-actions">
          <button className="nav-button ghost" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="nav-button primary" onClick={() => navigate('/register')}>
            Register Gym
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;