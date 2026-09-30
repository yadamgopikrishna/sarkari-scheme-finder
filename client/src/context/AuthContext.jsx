import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import LoginWarningModal from '../components/LoginWarningModal';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sarkari_token'));
  const [loading, setLoading] = useState(true);

  // Global Login Warning Modal state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginFeatureName, setLoginFeatureName] = useState('this feature');

  // Load user profile on initial mount if token is stored
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data.success) {
      const { token: jwtToken, ...userData } = res.data.data;
      localStorage.setItem('sarkari_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      const { token: jwtToken, ...userData } = res.data.data;
      localStorage.setItem('sarkari_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('sarkari_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updateData) => {
    const res = await api.put('/auth/profile', updateData);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, ...res.data.data }));
      return res.data;
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  /**
   * Helper to check authentication before accessing protected actions.
   * If not logged in, opens the warning modal and returns false.
   */
  const requireAuth = (featureName = 'this feature') => {
    if (!isAuthenticated) {
      setLoginFeatureName(featureName);
      setLoginModalOpen(true);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        requireAuth,
        openLoginModal: (feature) => {
          setLoginFeatureName(feature || 'this feature');
          setLoginModalOpen(true);
        },
      }}
    >
      {children}
      <LoginWarningModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        featureName={loginFeatureName}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
