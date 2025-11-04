import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider (a component that wraps your app)
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // 3. Check localStorage for a token on initial app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // 4. Login function
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  // 5. Logout function
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Create a custom "hook" to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};