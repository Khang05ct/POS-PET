import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
