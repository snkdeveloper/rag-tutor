import React from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

const ChatPage = ({
  question,
  setQuestion,
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  error,
  setError,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        `${API_BASE}/chat`,
        { question: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data;

      if (data.llm_fallback_available) {
        const consentMessage = data.llm_fallback_disclaimer ||
          "This answer is not in the course materials. Do you want an AI-generated fallback answer?";

        const disclaimerMessage = {
          role: "assistant",
          content: consentMessage,
          sources: [],
        };
        setMessages((prev) => [...prev, disclaimerMessage]);

        const consent = window.confirm(consentMessage);
        if (consent) {
          const fallbackRes = await axios.post(
            `${API_BASE}/chat`,
            { question: trimmed, llm_fallback: true },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const fallbackData = fallbackRes.data;
          const fallbackAnswerMessage = {
            role: "assistant",
            content: `${fallbackData.llm_fallback_disclaimer}\n\n${fallbackData.answer}`,
            sources: [],
          };
          setMessages((prev) => [...prev, fallbackAnswerMessage]);
        }
        return;
      }

      const answerMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, answerMessage]);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Something went wrong while contacting the tutor."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm">
            <p className="font-medium mb-1">
              Ask a question about your course materials.
            </p>
            <p>
              Your tutor will answer using only the documents your teacher
              uploaded.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-3xl ${
                msg.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 ml-1 text-xs text-slate-600">
                  <p className="font-semibold">Sources:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {msg.sources.map((s, i) => (
                      <li key={i}>
                        <span className="font-medium">
                          {s.document} (page {s.page})
                        </span>
                        {s.snippet && (
                          <span className="block text-[11px] text-slate-500">
                            "{s.snippet}"
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-end gap-2 bg-white rounded-lg border border-slate-200 shadow-sm p-3"
      >
        <textarea
          className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm resize-none h-16"
          placeholder="Ask a question about the course material..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isLoading) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
};

export default ChatPage;

