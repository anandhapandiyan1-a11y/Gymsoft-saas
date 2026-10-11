import React, { useEffect, useState } from 'react';
import { getSuperAdminDashboardApi } from '../services/api';

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getSuperAdminDashboardApi()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <div style={{ padding: '20px', color: '#fff', background: '#0f172a', minHeight: '100vh' }}>Loading Super Admin SaaS Control Room...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell" style={{ maxWidth: '1100px' }}>
        <div className="dashboard-header">
          <div>
            <h1>Super Admin SaaS Control Panel</h1>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="label">Total Platform Users</span>
            <div className="value" style={{ color: '#38bdf8' }}>{data.total_platform_users || 0}</div>
          </div>
          <div className="stat-card">
            <span className="label">Active Gym Owners</span>
            <div className="value" style={{ color: '#34d399' }}>{data.total_gym_owners || 0}</div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Registered Gym Owners List</h3>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Owner Name</th>
                <th>Gym Name</th>
                <th>Phone</th>
                <th>Plan Tier</th>
                <th>Trial Status</th>
              </tr>
            </thead>
            <tbody>
              {data.gym_owners_list && data.gym_owners_list.length > 0 ? (
                data.gym_owners_list.map((o) => (
                  <tr key={o.id || o.phone}>
                    <td style={{ fontWeight: 700 }}>{o.name}</td>
                    <td>{o.gym_name}</td>
                    <td style={{ color: 'var(--text-soft)' }}>{o.phone}</td>
                    <td><span className="category-pill">{o.plan}</span></td>
                    <td style={{ color: o.trial_active ? '#34d399' : '#fbbf24', fontWeight: 800 }}>{o.trial_active ? 'Active Trial (2 Days)' : 'Subscribed'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-soft)' }}>
                    No gym owners registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;