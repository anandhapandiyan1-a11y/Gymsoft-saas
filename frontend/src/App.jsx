import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import MemberDashboard from './pages/MemberDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  return (
    <div className="app-shell">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;