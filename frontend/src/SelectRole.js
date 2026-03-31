import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const SelectRole = () => {
  const { switchRole, user } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    switchRole(role);
    navigate(role === "student" ? "/chat" : "/upload");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-center text-slate-600 text-sm mb-8">
            Choose your role to continue
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Student Role */}
            <button
              onClick={() => handleSelectRole("student")}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                👨‍🎓
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Continue as Student
              </h2>
              <p className="text-sm text-slate-600">
                Ask questions about your course materials
              </p>
            </button>

            {/* Teacher Role */}
            <button
              onClick={() => handleSelectRole("teacher")}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Continue as Teacher
              </h2>
              <p className="text-sm text-slate-600">
                Upload and manage course materials
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
