import React, { createContext, useCallback, useContext, useState } from "react";
import { ensureFileToken, clearFileToken } from "../utils/fileUrl";
import { checkStoredToken, getStoredUser } from "../utils/authPaths";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());

  const login = async (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    clearFileToken(); // a token left by the previous user
    // video users don't use the main API's file links
    if (userData?.role !== "videoUser") ensureFileToken(userData?.token);
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    clearFileToken();
    setUser(null);
  }, []);

  // Checks the stored token with the server. An expired / rejected token is
  // cleared (logged out); a network or server error keeps it.
  // Returns "valid" | "invalid" | "error" | "none" (nothing stored).
  const verifySession = useCallback(async () => {
    const stored = getStoredUser();
    if (!stored) return "none";
    const result = await checkStoredToken(stored);
    if (result === "invalid") logout();
    return result;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
