import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { TrophyIcon, TargetIcon, AlertTriangleIcon } from "@/components/Icons";

export default function TestPage() {
  const { mockId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [mock, setMock] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // LOAD MOCK
  useEffect(() => {
    const loadMock = async () => {
      try {
        const snap = await getDoc(doc(db, "mockTests", mockId));

        if (!snap.exists()) {
          alert("Mock test not found");
          navigate("/mocktest");
          return;
        }

        const data = snap.data();
        setMock(data);
        setQuestions(data.questions || []);
        setTimeLeft((data.duration || 30) * 60);
      } catch (error) {
        console.error(error);
        alert("Failed to load test. Please check connection.");
      }
      setLoading(false);
    };

    loadMock();
  }, [mockId, navigate]);

  // TIMER
  useEffect(() => {
    if (loading || score !== null) return;

    if (timeLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, score]);

  // FORMAT TIME
  const formatTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const selectAnswer = (questionIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  // SUBMIT
  const submitTest = async () => {
    setSubmitting(true);
    let marks = 0;

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer === q.answer) {
        marks++;
      }
    });

    try {
      const user = auth.currentUser;

      if (user) {
        await setDoc(
          doc(db, "user_progress", user.uid, "mock_tests", mockId),
          {
            mockId,
            title: mock?.title || "Mock Test",
            score: marks,
            totalQuestions: questions.length,
            percentage: Math.round((marks / (questions.length || 1)) * 100),
            answers,
            submittedAt: Timestamp.now(),
          }
        );
      }

      setScore(marks);
      setShowConfirmModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save result. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading assessment environment…</span>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft < 60;
  const isWarning = timeLeft < 300 && !isUrgent;

  // RENDER SUBMITTED STATE
  if (score !== null) {
    const percentage = Math.round((score / (questions.length || 1)) * 100);
    const passed = percentage >= 60;

    return (
      <div className="page" style={{ maxWidth: "800px", margin: "40px auto" }}>
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            {passed ? <TrophyIcon size={56} color="var(--color-green)" /> : <TargetIcon size={56} color="var(--color-blue)" />}
          </div>

          <span className={`badge ${passed ? "badge-success" : "badge-warning"}`} style={{ fontSize: "14px", padding: "6px 16px" }}>
            {passed ? "Assessment Passed" : "Assessment Completed"}
          </span>

          <h1 style={{ color: "var(--color-navy)", margin: "16px 0 8px 0" }}>
            Test Submitted Successfully
          </h1>

          <p style={{ color: "var(--color-grey-muted)", fontSize: "15px", marginBottom: "32px" }}>
            {mock?.title}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              padding: "24px",
              background: "var(--color-grey-bg)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "36px"
            }}
          >
            <div>
              <span style={{ fontSize: "13px", color: "var(--color-grey-muted)" }}>Raw Score</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-navy)", marginTop: "4px" }}>
                {score} / {questions.length}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "13px", color: "var(--color-grey-muted)" }}>Percentage</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: passed ? "var(--color-green)" : "var(--color-blue)", marginTop: "4px" }}>
                {percentage}%
              </div>
            </div>

            <div>
              <span style={{ fontSize: "13px", color: "var(--color-grey-muted)" }}>Completion</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-navy)", marginTop: "4px" }}>
                {answeredCount}/{questions.length}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/mock-review/${mockId}`)}
              style={{ padding: "12px 24px" }}
            >
              Review Questions & Explanations →
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate("/mocktest")}
              style={{ padding: "12px 24px" }}
            >
              Return to Mock Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="page" style={{ maxWidth: "1200px" }}>
      {/* Top Test Header with Prominent Timer */}
      <div
        className="card"
        style={{
          padding: "16px 24px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "var(--shadow-sm)",
          position: "sticky",
          top: "16px",
          zIndex: 10,
        }}
      >
        <div>
          <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em" }}>
            Live Assessment Mode
          </span>
          <h2 style={{ margin: "2px 0 0 0", fontSize: "20px", color: "var(--color-navy)" }}>
            {mock?.title || "Mock Test"}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "13px", color: "var(--color-grey-muted)" }}>
            Progress: <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> Answered
          </div>

          {/* Color-changing timer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "var(--radius-pill)",
              background: isUrgent
                ? "var(--color-red-light)"
                : isWarning
                ? "var(--color-amber-light)"
                : "var(--color-navy)",
              color: isUrgent
                ? "var(--color-red)"
                : isWarning
                ? "#92400e"
                : "var(--color-white)",
              fontWeight: 800,
              fontSize: "16px",
              letterSpacing: "0.04em",
              border: isUrgent
                ? "1px solid var(--color-red)"
                : isWarning
                ? "1px solid var(--color-amber)"
                : "none",
              animation: isUrgent ? "pulse 1s infinite" : "none",
            }}
          >
            <span>⏱️</span>
            <span>{formatTime()}</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowConfirmModal(true)}
            style={{ padding: "8px 18px", fontSize: "13px" }}
          >
            Finish & Submit
          </button>
        </div>
      </div>

      {/* Main Grid: Question Content & Navigator Sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Question Panel */}
        {currentQ && (
          <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", minHeight: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--color-grey-border)" }}>
              <span className="badge badge-info" style={{ fontSize: "12px" }}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {currentQ.difficulty && (
                <span className="badge badge-neutral">
                  {currentQ.difficulty}
                </span>
              )}
            </div>

            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-navy)", lineHeight: 1.5, marginBottom: "28px" }}>
              {currentQ.question}
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {(currentQ.options || []).map((option, optIdx) => {
                const isSelected = answers[currentQuestionIndex] === option;
                return (
                  <label
                    key={optIdx}
                    onClick={() => selectAnswer(currentQuestionIndex, option)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px 20px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "2px solid var(--color-blue)" : "1.5px solid var(--color-grey-border)",
                      background: isSelected ? "var(--color-blue-badge)" : "var(--color-white)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q_${currentQuestionIndex}`}
                      checked={isSelected}
                      onChange={() => selectAnswer(currentQuestionIndex, option)}
                      style={{ accentColor: "var(--color-blue)", width: "18px", height: "18px" }}
                    />
                    <span style={{ fontSize: "15px", color: "var(--color-navy)", fontWeight: isSelected ? 600 : 400 }}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Pagination Controls inside Question Panel */}
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--color-grey-border)" }}>
              <button
                className="btn btn-secondary"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                style={{ opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}
              >
                ← Previous
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setAnswers((prev) => {
                    const copy = { ...prev };
                    delete copy[currentQuestionIndex];
                    return copy;
                  });
                }}
                style={{ fontSize: "12px", color: "var(--color-grey-muted)" }}
              >
                Clear Choice
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  Next Question →
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowConfirmModal(true)}
                  style={{ background: "var(--color-green)" }}
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Question Navigator */}
        <div className="card" style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "var(--color-navy)", fontSize: "15px" }}>
            Question Navigator
          </h4>

          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", fontSize: "11px", color: "var(--color-grey-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-blue)" }} /> Answered
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid var(--color-grey-border)", background: "var(--color-white)" }} /> Pending
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    height: "38px",
                    borderRadius: "var(--radius-sm)",
                    border: isCurrent
                      ? "2px solid var(--color-navy)"
                      : isAnswered
                      ? "1px solid var(--color-blue)"
                      : "1px solid var(--color-grey-border)",
                    background: isCurrent
                      ? "var(--color-navy)"
                      : isAnswered
                      ? "var(--color-blue-badge)"
                      : "var(--color-white)",
                    color: isCurrent
                      ? "white"
                      : isAnswered
                      ? "var(--color-blue)"
                      : "var(--color-grey-text)",
                    fontWeight: isCurrent || isAnswered ? 700 : 500,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-grey-border)" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setShowConfirmModal(true)}
            >
              Submit Test ({answeredCount}/{questions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Styled Submit Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(5, 47, 63, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: "28px",
              boxShadow: "var(--shadow-lg)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <AlertTriangleIcon size={38} color="var(--color-amber)" />
            </div>
            <h3 style={{ margin: "0 0 8px 0", color: "var(--color-navy)", textAlign: "center" }}>
              Submit Assessment?
            </h3>
            <p style={{ color: "var(--color-grey-muted)", fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
              You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
              {answeredCount < questions.length && (
                <span style={{ display: "block", color: "var(--color-amber)", marginTop: "6px" }}>
                  You still have {questions.length - answeredCount} unanswered questions!
                </span>
              )}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Continue Test
              </button>
              <button
                className="btn btn-primary"
                onClick={submitTest}
                disabled={submitting}
                style={{ background: "var(--color-green)" }}
              >
                {submitting ? "Submitting…" : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}