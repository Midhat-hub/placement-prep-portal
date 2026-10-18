import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { AlertTriangleIcon, LightbulbIcon } from "@/components/Icons";

export default function MockReview() {
  const { mockId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [mockTitle, setMockTitle] = useState("Mock Test");
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReview = async () => {
      try {
        // Load mock
        const mockSnap = await getDoc(doc(db, "mockTests", mockId));

        if (!mockSnap.exists()) {
          alert("Mock test record not found");
          return;
        }

        const mockData = mockSnap.data();
        setMockTitle(mockData.title || "Mock Test");
        setQuestions(mockData.questions || []);

        // Load user attempt
        const user = auth.currentUser;

        if (user) {
          const attemptSnap = await getDoc(
            doc(db, "user_progress", user.uid, "mock_tests", mockId)
          );

          if (attemptSnap.exists()) {
            setAttempt(attemptSnap.data());
          }
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    loadReview();
  }, [mockId]);

  if (loading) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading assessment review…</span>
        </div>
      </div>
    );
  }

  const score = attempt?.score ?? 0;
  const total = attempt?.totalQuestions || questions.length || 1;
  const percentage = attempt?.percentage ?? Math.round((score / total) * 100);
  const passed = percentage >= 60;

  return (
    <div className="page" style={{ maxWidth: "1000px" }}>
      {/* Top Banner */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            style={{ fontSize: "12px", padding: "6px 14px", marginBottom: "8px" }}
          >
            ← Back
          </button>
          <h1 className="page-heading" style={{ margin: 0 }}>
            {mockTitle} — Review
          </h1>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/mocktest")}
          style={{ fontSize: "13px" }}
        >
          Mock Test Hub →
        </button>
      </div>

      {/* Summary Score Card */}
      {attempt ? (
        <div
          className="card"
          style={{
            padding: "28px",
            marginBottom: "28px",
            background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-blue) 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.75)" }}>
              Evaluation Report
            </span>
            <h2 style={{ color: "white", margin: "4px 0 12px 0", fontSize: "28px" }}>
              Score: {attempt.score} / {attempt.totalQuestions || questions.length}
            </h2>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span className={`badge ${passed ? "badge-success" : "badge-warning"}`} style={{ fontSize: "13px", padding: "6px 14px" }}>
                {passed ? "Passed (≥ 60%)" : "Needs Practice"}
              </span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
                Accuracy: <strong>{percentage}%</strong>
              </span>
            </div>
          </div>

          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "3px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            {percentage}%
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "16px 20px", marginBottom: "28px", background: "var(--color-amber-light)", borderColor: "var(--color-amber)", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertTriangleIcon size={18} color="var(--color-amber)" />
          <p style={{ margin: 0, color: "#92400e", fontSize: "14px" }}>
            No personal submission recorded for this mock test. Viewing answer keys for reference.
          </p>
        </div>
      )}

      {/* Questions Review List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {questions.map((q, index) => {
          const userAnswer = attempt?.answers?.[index];
          const isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
          const isCorrect = isAnswered && userAnswer === q.answer;

          return (
            <div
              key={index}
              className="card"
              style={{
                padding: "24px",
                borderLeft: `5px solid ${
                  !isAnswered
                    ? "var(--color-amber)"
                    : isCorrect
                    ? "var(--color-green)"
                    : "var(--color-red)"
                }`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-navy)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--color-blue)", marginRight: "8px" }}>Q{index + 1}.</span>
                  {q.question}
                </span>

                <span
                  className={`badge ${
                    !isAnswered
                      ? "badge-warning"
                      : isCorrect
                      ? "badge-success"
                      : "badge-error"
                  }`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {!isAnswered ? "Not Attempted" : isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>

              {/* Options list if available */}
              {q.options && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = userAnswer === opt;
                    const isTheCorrectAnswer = q.answer === opt;

                    let bg = "var(--color-white)";
                    let border = "1px solid var(--color-grey-border)";
                    let tag = null;

                    if (isTheCorrectAnswer) {
                      bg = "var(--color-green-light)";
                      border = "1.5px solid var(--color-green)";
                      tag = "Correct Answer";
                    } else if (isUserChoice && !isCorrect) {
                      bg = "var(--color-red-light)";
                      border = "1.5px solid var(--color-red)";
                      tag = "Your Answer";
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: bg,
                          border: border,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "14px",
                          color: "var(--color-navy)",
                        }}
                      >
                        <span>{opt}</span>
                        {tag && (
                          <span style={{ fontSize: "12px", fontWeight: 700, color: isTheCorrectAnswer ? "var(--color-green)" : "var(--color-red)" }}>
                            {tag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explanation panel if present */}
              {q.explanation && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "var(--color-grey-bg)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-grey-border)",
                    fontSize: "13px",
                    color: "var(--color-grey-text)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px"
                  }}
                >
                  <LightbulbIcon size={16} color="var(--color-navy)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ color: "var(--color-navy)" }}>Explanation: </strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}