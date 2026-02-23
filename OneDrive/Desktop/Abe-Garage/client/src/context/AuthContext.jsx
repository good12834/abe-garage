import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Token is handled by api interceptors

  // API interceptors handle token expiration

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        setUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem("token", authToken);

      toast.success("Login successful!");
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      const { user: newUser, token: authToken } = response.data.data;

      setUser(newUser);
      setToken(authToken);
      localStorage.setItem("token", authToken);

      toast.success("Registration successful!");
      return { success: true, user: newUser };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      const updatedUser = response.data.data.user;

      setUser(updatedUser);
      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Profile update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Password change failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
