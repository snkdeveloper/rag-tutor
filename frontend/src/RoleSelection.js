import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    // Store the selected role in sessionStorage so signin/signup pages know which type to show
    sessionStorage.setItem("selectedRole", role);
    navigate(`/signin`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-slate-900 text-center mb-3">
            RAG Tutoring System
          </h1>
          <p className="text-center text-slate-600 text-sm mb-12">
            Choose your role to get started
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Student Role */}
            <button
              onClick={() => handleSelectRole("student")}
              className="p-8 border-2 border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform text-center">
                👨‍🎓
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">
                Student
              </h2>
              <p className="text-sm text-slate-600 text-center">
                Ask questions about your course materials
              </p>
            </button>

            {/* Teacher Role */}
            <button
              onClick={() => handleSelectRole("teacher")}
              className="p-8 border-2 border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform text-center">
                👨‍🏫
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">
                Teacher
              </h2>
              <p className="text-sm text-slate-600 text-center">
                Upload and manage course materials
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
