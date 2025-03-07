// import React, { createContext, useContext, useState } from "react";

// // ✅ Create Context
// export const AuthContext = createContext();

// // ✅ Create Provider
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")) || null);

//   const login = (userData) => {
//     sessionStorage.setItem("user", JSON.stringify(userData));
//     setUser(userData);
//   };

//   const logout = () => {
//     sessionStorage.removeItem("user");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ✅ Custom Hook
// export const useAuth = () => useContext(AuthContext);


import React, { createContext, useContext, useState, useEffect } from "react";

// ✅ Create Context
export const AuthContext = createContext();

// ✅ Create Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");

    // Check if token is expired
    if (storedUser && tokenExpiry && Date.now() > tokenExpiry) {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("tokenExpiry");
      return null;
    }

    return storedUser;
  });

  const login = (userData, tokenExpiryDuration = 30 * 60 * 1000) => {
    const expiryTime = Date.now() + tokenExpiryDuration; // Set expiry time (default 30 minutes)
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("tokenExpiry", expiryTime);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("tokenExpiry");
    setUser(null);
  };

  // ✅ Check token expiration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const tokenExpiry = sessionStorage.getItem("tokenExpiry");
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

// ✅ Custom Hook
export const useAuth = () => useContext(AuthContext);
