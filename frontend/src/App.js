import React, { useState } from "react";
import { Link, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import UploadPage from "./UploadPage";
import ChatPage from "./ChatPage";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ForgotPassword from "./ForgotPassword";
import RoleSelection from "./RoleSelection";

const AppContent = () => {
  const { isAuthenticated, userRole, user, logout } = useAuth();
  const navigate = useNavigate();

  // Chat page state
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [errorChat, setErrorChat] = useState("");

  // Upload page state
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messageUpload, setMessageUpload] = useState("");
  const [errorUpload, setErrorUpload] = useState("");
  const [documents, setDocuments] = useState([]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem("selectedRole");
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">RAG Tutoring System</h1>
          <nav className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                {userRole === "student" ? "👨‍🎓" : "👨‍🏫"}{" "}
                {user?.name || "User"}
              </span>
              <div className="flex gap-2">
                <Link to="/chat" className="px-3 py-1 rounded-md hover:bg-slate-800 transition-colors text-xs">
                  Chat
                </Link>
                {userRole === "teacher" && (
                  <Link to="/upload" className="px-3 py-1 rounded-md hover:bg-slate-800 transition-colors text-xs">
                    Upload
                  </Link>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors text-xs"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route
              path="/chat"
              element={
                <ChatPage
                  question={question}
                  setQuestion={setQuestion}
                  messages={messages}
                  setMessages={setMessages}
                  isLoading={isLoadingChat}
                  setIsLoading={setIsLoadingChat}
                  error={errorChat}
                  setError={setErrorChat}
                  documents={documents}
                />
              }
            />
            <Route
              path="/upload"
              element={
                userRole === "teacher" ? (
                  <UploadPage
                    file={file}
                    setFile={setFile}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                    message={messageUpload}
                    setMessage={setMessageUpload}
                    error={errorUpload}
                    setError={setErrorUpload}
                    documents={documents}
                    setDocuments={setDocuments}
                  />
                ) : (
                  <Navigate to="/chat" replace />
                )
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/*" element={<AppContent />} />
    </Routes>
  );
};

export default App;

