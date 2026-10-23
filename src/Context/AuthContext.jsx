import React, { createContext, useContext, useState } from "react";
import { ensureFileToken, clearFileToken } from "../utils/fileUrl";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return storedUser ? storedUser : null;
  });

  const login = async (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    clearFileToken(); // a token left by the previous user
    ensureFileToken(userData?.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    clearFileToken();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
