import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";
import { CheckCircleIcon, XCircleIcon } from "@/components/Icons";

function QuestionPage() {
  const { collectionName, id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    async function load() {
      let ref;
      if (collectionName === "company_aptitude") {
        ref = doc(db, "company_prep", "company_aptitude", "items", id);
      } else {
        ref = doc(db, "questions", collectionName, "items", id);
      }

      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setQuestion(snapshot.data());
      }
    }

    load();
  }, [collectionName, id]);

  async function submitAnswer() {
    if (!selected) {
      alert("Please select an answer first.");
      return;
    }

    setSubmitting(true);
    const correct = selected === question.answer;
    setResult(correct ? "Correct" : "Wrong");

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    const userId = auth.currentUser?.uid;

    if (userId) {
      try {
        await setDoc(
          doc(db, "user_progress", userId, "attempts", id),
          {
            correct,
            timeTaken,
            attemptedAt: new Date().toISOString(),
          }
        );
      } catch (e) {
        console.error("Failed to record attempt:", e);
      }
    }
    setSubmitting(false);
  }

  if (!question) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading question…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{ fontSize: "12px", padding: "6px 14px", marginBottom: "12px" }}
        >
          ← Back to Questions
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em" }}>
              {collectionName?.replace("_", " ")} Practice
            </span>
            <h1 className="page-heading" style={{ margin: "2px 0 0 0", fontSize: "24px" }}>
              Practice Question
            </h1>
          </div>

          {question.difficulty && (
            <span className="badge badge-info">
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-navy)", lineHeight: 1.6 }}>
          {question.question}
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {question.options?.map((opt, i) => {
            const isSelected = selected === opt;
            const isSubmitted = result !== null;
            const isCorrectAnswer = isSubmitted && opt === question.answer;
            const isWrongChoice = isSubmitted && isSelected && !isCorrectAnswer;

            let border = "1.5px solid var(--color-grey-border)";
            let bg = "var(--color-white)";

            if (isSubmitted) {
              if (isCorrectAnswer) {
                border = "2px solid var(--color-green)";
                bg = "var(--color-green-light)";
              } else if (isWrongChoice) {
                border = "2px solid var(--color-red)";
                bg = "var(--color-red-light)";
              }
            } else if (isSelected) {
              border = "2px solid var(--color-blue)";
              bg = "var(--color-blue-badge)";
            }

            return (
              <label
                key={i}
                onClick={() => !isSubmitted && setSelected(opt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  border,
                  background: bg,
                  cursor: isSubmitted ? "default" : "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="radio"
                  name="mcq_answer"
                  checked={isSelected}
                  onChange={() => !isSubmitted && setSelected(opt)}
                  disabled={isSubmitted}
                  style={{ accentColor: "var(--color-blue)", width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "15px", color: "var(--color-navy)", fontWeight: isSelected || isCorrectAnswer ? 600 : 400, flex: 1 }}>
                  {opt}
                </span>

                {isSubmitted && isCorrectAnswer && (
                  <span style={{ color: "var(--color-green)", fontWeight: 700, fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircleIcon size={14} color="var(--color-green)" /> Correct
                  </span>
                )}
                {isSubmitted && isWrongChoice && (
                  <span style={{ color: "var(--color-red)", fontWeight: 700, fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <XCircleIcon size={14} color="var(--color-red)" /> Your Choice
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {/* Result Message */}
        {result && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-sm)",
              background: result === "Correct" ? "var(--color-green-light)" : "var(--color-red-light)",
              borderLeft: `5px solid ${result === "Correct" ? "var(--color-green)" : "var(--color-red)"}`,
              color: result === "Correct" ? "#14532d" : "#7f1d1d",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              {result === "Correct" ? (
                <CheckCircleIcon size={20} color="var(--color-green)" style={{ flexShrink: 0, marginTop: "2px" }} />
              ) : (
                <XCircleIcon size={20} color="var(--color-red)" style={{ flexShrink: 0, marginTop: "2px" }} />
              )}
              <div>
                <strong style={{ fontSize: "15px" }}>
                  {result === "Correct" ? "Excellent! Correct Answer." : "Incorrect. Keep practicing!"}
                </strong>
                {question.explanation && (
                  <p style={{ margin: "6px 0 0 0", fontSize: "13px", opacity: 0.9 }}>
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--color-grey-border)" }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          {!result ? (
            <button
              className="btn btn-primary"
              onClick={submitAnswer}
              disabled={!selected || submitting}
              style={{
                opacity: !selected || submitting ? 0.5 : 1,
                cursor: !selected || submitting ? "not-allowed" : "pointer"
              }}
            >
              {submitting ? "Checking…" : "Submit Answer"}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate(-1)}
            >
              Next Question →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPage;