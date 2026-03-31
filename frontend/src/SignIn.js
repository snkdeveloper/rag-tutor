import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const API_BASE = "http://localhost:8000";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Get the role selected from RoleSelection page
    const selectedRole = sessionStorage.getItem("selectedRole");
    if (!selectedRole) {
      navigate("/");
      return;
    }
    setRole(selectedRole);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Sign in failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      // Successfully signed in
      const userData = {
        id: data.user.email,
        name: data.user.name,
        email: data.user.email,
      };

      // Store token and login
      localStorage.setItem("access_token", data.access_token);
      login(userData, role);
      
      // Clear session storage
      sessionStorage.removeItem("selectedRole");
      
      navigate(role === "student" ? "/chat" : "/upload");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRole = () => {
    sessionStorage.removeItem("selectedRole");
    navigate("/");
  };

  if (!role) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center mb-2">
            <span className="text-3xl mr-2">
              {role === "student" ? "👨‍🎓" : "👨‍🏫"}
            </span>
            <h1 className="text-3xl font-bold text-slate-900">
              {role === "student" ? "Student" : "Teacher"} Sign In
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50"
                placeholder="john@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50"
                placeholder="••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Links */}
          <div className="text-center text-sm text-slate-600 mt-6 space-y-2">
            <p>
              <Link to={`/signup`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                Don't have an account? Sign Up
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot Password?
              </Link>
            </p>
            <p>
              <button
                onClick={handleBackToRole}
                className="text-indigo-600 hover:text-indigo-700 font-medium bg-none border-none cursor-pointer"
              >
                Back to Role Selection
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
