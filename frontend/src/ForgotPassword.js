import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // email, otp, newpassword, success
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const selectedRole = sessionStorage.getItem("selectedRole");
    if (!selectedRole) {
      navigate("/");
      return;
    }
    setRole(selectedRole);
  }, [navigate]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Simulate sending OTP
    setSuccess("OTP sent to your email");
    setStep("otp");
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    // Simulate OTP verification
    setSuccess("OTP verified successfully");
    setStep("newpassword");
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Password is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Simulate password reset
    setSuccess("Password reset successfully! Redirecting to sign in...");
    setStep("success");
    setTimeout(() => {
      sessionStorage.removeItem("selectedRole");
      navigate("/");
    }, 2000);
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
            <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          </div>
          <p className="text-center text-slate-600 text-sm mb-8">
            Follow the steps below to reset your password
          </p>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="john@example.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Send OTP
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="123456"
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Verify OTP
              </button>
            </form>
          )}

          {step === "newpassword" && (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Reset Password
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center">
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-3 mb-4">
                {success}
              </p>
              <p className="text-sm text-slate-600">Redirecting to role selection...</p>
            </div>
          )}

          <div className="text-center text-sm text-slate-600 mt-6">
            <button
              onClick={handleBackToRole}
              className="text-indigo-600 hover:text-indigo-700 font-medium bg-none border-none cursor-pointer"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
