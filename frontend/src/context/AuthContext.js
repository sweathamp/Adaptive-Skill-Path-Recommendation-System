import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// ✅ IMPORTANT: set backend base URL
axios.defaults.baseURL = "https://adaptive-skill-path-recommendation-system.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sf_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ✅ SAFE PROFILE FETCH (NO CRASH)
  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile'); // backend route
      setUser(res.data);
    } catch (err) {
      console.log("Profile fetch failed", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN
  const login = async (email, password, role = 'user') => {
    const res = await axios.post('/api/auth/login', { email, password, role });
    const { token: t, user: u } = res.data;

    localStorage.setItem('sf_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;

    setToken(t);
    setUser(u);

    return u;
  };

  // ✅ REGISTER
  const register = async (email, password, name) => {
    const res = await axios.post('/api/auth/register', { email, password, name });
    const { token: t, user: u } = res.data;

    localStorage.setItem('sf_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;

    setToken(t);
    setUser(u);

    return u;
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('sf_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);