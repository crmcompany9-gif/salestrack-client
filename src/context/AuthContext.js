import { createContext, useContext, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://salestrack-server.onrender.com';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(() => JSON.parse(localStorage.getItem('st_user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('st_token') || null);

  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('st_token', data.token);
    localStorage.setItem('st_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('st_token');
    localStorage.removeItem('st_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
