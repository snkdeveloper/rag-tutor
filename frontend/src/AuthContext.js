import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // "student" or "teacher"
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData, role) => {
    setUser(userData);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", role);
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
