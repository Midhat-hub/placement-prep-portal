import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrophyIcon, TargetIcon } from "@/components/Icons";

export default function PracticeTestPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const storedQuestions = JSON.parse(localStorage.getItem("mockQuestions")) || [];
    const storedTest = JSON.parse(localStorage.getItem("currentTest"));

    if (!storedQuestions.length) {
      navigate("/practice-test");
      return;
    }

    setQuestions(storedQuestions);
    setTest(storedTest);
    setTimeLeft((storedTest?.time || 10) * 60);
  }, [navigate]);

  useEffect(() => {
    if (!test || questions.length === 0 || timeLeft === null || score !== null) return;

    if (timeLeft === 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, score, test, questions]);

  const formatTime = () => {
    if (timeLeft === null) return "--:--";
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

  const submitTest = () => {
    let marks = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        marks++;
      }
    });
    setScore(marks);
  };

  const goBack = () => {
    localStorage.removeItem("mockQuestions");
    localStorage.removeItem("currentTest");
    navigate("/practice-test");
  };

  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft !== null && timeLeft < 60;
  const isWarning = timeLeft !== null && timeLeft < 300 && !isUrgent;

  // SUBMITTED STATE
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
            {passed ? "Practice Session Passed" : "Practice Completed"}
          </span>

          <h1 style={{ color: "var(--color-navy)", margin: "16px 0 8px 0" }}>
            {test?.title || "Practice Assessment"}
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              padding: "24px",
              background: "var(--color-grey-bg)",
              borderRadius: "var(--radius-lg)",
              margin: "32px 0",
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
              <span style={{ fontSize: "13px", color: "var(--color-grey-muted)" }}>Answered</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-navy)", marginTop: "4px" }}>
                {answeredCount}/{questions.length}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={goBack} style={{ padding: "12px 28px" }}>
              Take Another Practice Test →
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/mocktest")} style={{ padding: "12px 24px" }}>
              Back to Mock Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="page" style={{ maxWidth: "1200px" }}>
      {/* Sticky Topbar */}
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
          <span className="badge badge-info" style={{ marginBottom: "4px" }}>
            Self-Paced Practice
          </span>
          <h2 style={{ margin: 0, fontSize: "20px", color: "var(--color-navy)" }}>
            {test?.title || "Practice Test"}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", color: "var(--color-grey-muted)" }}>
            Progress: <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> Answered
          </span>

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
            }}
          >
            <span>⏱️</span>
            <span>{formatTime()}</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={submitTest}
            style={{ padding: "8px 18px", fontSize: "13px" }}
          >
            Finish Practice
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Question Area */}
        {currentQ && (
          <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", minHeight: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--color-grey-border)" }}>
              <span className="badge badge-info">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="badge badge-neutral" style={{ textTransform: "uppercase" }}>
                {currentQ.subject || currentQ.category || "Practice"}
              </span>
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

            {/* Navigation buttons */}
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
                Clear Answer
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
                  onClick={submitTest}
                  style={{ background: "var(--color-green)" }}
                >
                  Submit Practice Test
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Navigator */}
        <div className="card" style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "var(--color-navy)", fontSize: "15px" }}>
            Question Navigator
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              maxHeight: "360px",
              overflowY: "auto",
              marginBottom: "20px",
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
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={submitTest}
          >
            Submit Test ({answeredCount}/{questions.length})
          </button>
        </div>
      </div>
    </div>
  );
}
