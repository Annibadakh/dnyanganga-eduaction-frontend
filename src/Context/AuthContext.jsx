import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (storedUser && tokenExpiry && Date.now() > tokenExpiry) {
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
      return null;
    }

    return storedUser;
  });

  const login = (userData, tokenExpiryDuration = 60 * 60 * 1000) => {
    const expiryTime = Date.now() + tokenExpiryDuration; // Default: 30 minutes
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("tokenExpiry", expiryTime);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    setUser(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      if (tokenExpiry && Date.now() > tokenExpiry) {
        logout();
      }
    }, 60 * 1000); // Check every 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
