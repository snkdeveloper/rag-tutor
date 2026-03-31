import React, { useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

const UploadPage = ({
  file,
  setFile,
  isUploading,
  setIsUploading,
  message,
  setMessage,
  error,
  setError,
  documents,
  setDocuments,
}) => {
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("File uploaded and indexed successfully.");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Upload failed. Check file type (PDF/TXT/MD)."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Upload Course Material</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course Document (PDF / TXT / MD)
            </label>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="block text-sm text-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload & Index"}
          </button>
        </form>

        {message && (
          <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </section>

      <section className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Uploaded Documents</h2>
          <button
            onClick={fetchDocuments}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Refresh
          </button>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500">
            No documents uploaded yet. Upload a course document to get started.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 text-sm">
            {documents.map((doc, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">
                    {doc.filename || "Unknown file"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Type: {doc.type || "unknown"} • Uploaded:{" "}
                    {doc.uploaded_at || "N/A"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default UploadPage;

