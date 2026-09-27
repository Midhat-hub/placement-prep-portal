import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db, auth } from "@/firebase/firebase";

function CodingIDEPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");

  const [darkMode, setDarkMode] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const languages = {
    python: "Python",
    java: "Java",
    cpp: "C++",
    javascript: "JavaScript",
  };

  useEffect(() => {
    async function loadProblem() {
      try {
        const problemRef = doc(db, "coding_questions", id);

        const snapshot = await getDoc(problemRef);

        if (!snapshot.exists()) {
          setProblem(null);
          return;
        }

        const data = {
          id: snapshot.id,
          ...snapshot.data(),
        };

        setProblem(data);

        if (data.starter_code?.python) {
          setCode(data.starter_code.python);
        }
      } catch (error) {
        console.error("Error loading coding problem:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProblem();
  }, [id]);

  function changeLanguage(newLanguage) {
    setLanguage(newLanguage);

    if (problem?.starter_code?.[newLanguage]) {
      setCode(problem.starter_code[newLanguage]);
    }
  }

  async function submitCode() {
    if (!code.trim()) {
      setResult({
        type: "error",
        message: "Please write some code first.",
      });
      return;
    }

    setSubmitting(true);

    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/coding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem_id: id,
          language,
          source_code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setResult(data);

      /*
       * Save completion only after ALL
       * hidden tests pass.
       */
      if (data.status === "accepted" && auth.currentUser) {
        await setDoc(
          doc(db, "user_progress", auth.currentUser.uid, "coding", id),
          {
            completed: true,
            completedAt: new Date().toISOString(),
          },
          {
            merge: true,
          },
        );
      }
    } catch (error) {
      console.error(error);

      setResult({
        type: "error",
        message: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h2 className="page-heading">Loading...</h2>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page">
        <h2 className="page-heading">Problem Not Found</h2>

        <button
          className="solve-btn"
          onClick={() => navigate("/practice/dsa-coding")}
        >
          Back to Questions
        </button>
      </div>
    );
  }

  const theme = darkMode
    ? {
        page: "#0f172a",
        panel: "#111827",
        panel2: "#1e293b",
        text: "#e5e7eb",
        muted: "#94a3b8",
        border: "#334155",
        editor: "#020617",
      }
    : {
        page: "#f1f5f9",
        panel: "#ffffff",
        panel2: "#f8fafc",
        text: "#0f172a",
        muted: "#64748b",
        border: "#d1d5db",
        editor: "#f8fafc",
      };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 40px)",
        background: theme.page,
        color: theme.text,
        padding: "20px",
        borderRadius: "12px",
        transition: "all 0.2s ease",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => navigate("/practice/dsa-coding")}
          style={{
            padding: "9px 14px",
            borderRadius: "7px",
            border: `1px solid ${theme.border}`,
            background: theme.panel,
            color: theme.text,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            flex: 1,
            minWidth: "200px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
            }}
          >
            {problem.title}
          </h2>

          <div
            style={{
              marginTop: "5px",
              color: theme.muted,
              fontSize: "13px",
            }}
          >
            {problem.category} • {problem.difficulty}
          </div>
        </div>

        <button
          onClick={() => setDarkMode((prev) => !prev)}
          style={{
            padding: "9px 14px",
            borderRadius: "7px",
            border: `1px solid ${theme.border}`,
            background: theme.panel,
            color: theme.text,
            cursor: "pointer",
          }}
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Main IDE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 0.9fr) minmax(400px, 1.1fr)",
          gap: "18px",
        }}
      >
        {/* Problem panel */}
        <div
          style={{
            background: theme.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: "10px",
            padding: "22px",
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
          }}
        >
          <h3>Problem</h3>

          <p
            style={{
              lineHeight: "1.6",
              color: theme.text,
            }}
          >
            {problem.description}
          </p>

          {problem.constraints?.length > 0 && (
            <>
              <h3>Constraints</h3>

              <ul
                style={{
                  color: theme.muted,
                  lineHeight: "1.7",
                }}
              >
                {problem.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </>
          )}

          {problem.examples?.length > 0 && (
            <>
              <h3>Examples</h3>

              {problem.examples.map((example, index) => (
                <div
                  key={index}
                  style={{
                    background: theme.panel2,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <strong>Input:</strong> {example.input}
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                    }}
                  >
                    <strong>Output:</strong> {example.output}
                  </div>

                  {example.explanation && (
                    <div
                      style={{
                        marginTop: "6px",
                        color: theme.muted,
                      }}
                    >
                      {example.explanation}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Editor */}
        <div
          style={{
            background: theme.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: "10px",
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            minHeight: "600px",
          }}
        >
          {/* Editor toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              gap: "10px",
            }}
          >
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "7px",
                border: `1px solid ${theme.border}`,
                background: theme.panel2,
                color: theme.text,
                cursor: "pointer",
              }}
            >
              {Object.entries(languages).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <button
              onClick={submitCode}
              disabled={submitting}
              style={{
                padding: "9px 18px",
                borderRadius: "7px",
                border: "none",
                background: "#0f766e",
                color: "white",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>

          {/* Code editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            style={{
              flex: 1,
              width: "100%",
              minHeight: "500px",
              resize: "none",
              boxSizing: "border-box",
              background: theme.editor,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: "8px",
              padding: "18px",
              fontFamily: "'Fira Code', 'Consolas', monospace",
              fontSize: "14px",
              lineHeight: "1.6",
              outline: "none",
            }}
          />

          {/* Result */}
          {result && (
            <div
              style={{
                marginTop: "12px",
                padding: "14px",
                borderRadius: "8px",
                background:
                  result.status === "accepted"
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(239,68,68,0.12)",
                border:
                  result.status === "accepted"
                    ? "1px solid #10b981"
                    : "1px solid #ef4444",
              }}
            >
              {result.status === "accepted" ? (
                <>
                  <strong>✓ Accepted</strong>

                  <div
                    style={{
                      marginTop: "5px",
                      color: theme.muted,
                    }}
                  >
                    All hidden test cases passed.
                  </div>
                </>
              ) : (
                <>
                  <strong>✗ {result.message || "Submission failed"}</strong>

                  {result.failed_test && (
                    <div
                      style={{
                        marginTop: "5px",
                        color: theme.muted,
                      }}
                    >
                      Failed on test case {result.failed_test}.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodingIDEPage;
