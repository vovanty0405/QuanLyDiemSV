import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khôi phục session từ localStorage
    const initAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Kiểm tra xem token đã hết hạn chưa
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('accessToken');
            setUser(null);
          } else {
            setUser(decoded); // { UserID, Username, RoleID, MaGV, MaSV, ... }
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // Backend route: POST /api/auth/login
      const response = await axiosClient.post('/auth/login', { username, password });
      const token = response.data.accessToken;
      
      if (token) {
        localStorage.setItem('accessToken', token);
        const decoded = jwtDecode(token);
        setUser(decoded);
        return { success: true };
      }
      return { success: false, message: 'Đăng nhập thất bại' };
    } catch (error) {
      return { success: false, message: error.message || 'Lỗi kết nối đến máy chủ' };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

