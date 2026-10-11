import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('user_id');
    const fullName = localStorage.getItem('full_name');

    if (token && role && userId) {
      setUser({
        token,
        role,
        userId: parseInt(userId),
        fullName
      });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    const userId = data.user_id ?? data.id ?? null;

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user_id', userId ? String(userId) : '');
    localStorage.setItem('full_name', data.full_name);

    setUser({
      token: data.access_token,
      role: data.role,
      userId: userId ? Number(userId) : null,
      fullName: data.full_name
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};