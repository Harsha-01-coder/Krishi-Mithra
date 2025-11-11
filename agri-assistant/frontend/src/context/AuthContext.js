import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Optional: store user details
  const [loading, setLoading] = useState(true); // Loading state

  // 3. Check localStorage on initial app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Set the token for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false); // Done checking
  }, []);

  // 4. Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username,
        password,
      });
      
      const newToken = response.data.token;
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('token', newToken);
      return { success: true };

    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  // 5. Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // 6. Value to be passed to consumers
  const value = {
    token,
    user,
    login,
    logout,
    loading, // Pass loading state
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until we've checked for a token */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 7. Create a custom "hook" to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};