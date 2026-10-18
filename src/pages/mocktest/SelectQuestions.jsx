import { useState } from "react";
import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";
import { PlusIcon } from "@/components/Icons";

export default function SelectQuestions({ onNext }) {
  const [questions] = useState(() => [
    ...core.map((q) => ({ ...q, subject: q.subject || "core" })),
    ...dsa.map((q) => ({ ...q, subject: "dsa" })),
    ...aptitude.map((q) => ({ ...q, subject: "aptitude" })),
  ]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [category, setCategory] = useState("all");
  const [customQuestion, setCustomQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

  const handleSelect = (question, isChecked) => {
    if (isChecked) {
      setSelectedQuestions((prev) => [...prev, question]);
    } else {
      setSelectedQuestions((prev) =>
        prev.filter((q) => q.question !== question.question)
      );
    }
  };

  const handleAddCustom = () => {
    if (!customQuestion.trim()) {
      alert("Please enter the question");
      return;
    }

    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert("Please fill in all 4 options");
      return;
    }

    const newCustom = {
      question: customQuestion,
      subject: "custom",
      id: Date.now(),
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD,
      },
      correctAnswer: correctAnswer,
    };
    setSelectedQuestions((prev) => [...prev, newCustom]);

    // Reset form
    setCustomQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");

    alert("Custom MCQ added to selection!");
  };

  const handleRemoveCustom = (id) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const filteredQuestions = questions.filter((q) => {
    const subject = q.subject?.toLowerCase();
    if (category === "all") return true;
    if (category === "core") {
      return (
        subject === "os" ||
        subject === "dbms" ||
        subject === "oops" ||
        subject === "core"
      );
    }
    if (category === "dsa") return subject === "dsa";
    if (category === "aptitude") return subject === "aptitude";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Custom Question Builder Card */}
      <div className="card" style={{ padding: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "8px" }}>
          <PlusIcon size={18} color="var(--color-blue)" />
          Add Custom Question
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Question Statement</label>
            <textarea
              placeholder="Type your custom question statement here…"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              rows="3"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-grey-border)",
                fontSize: "14px",
                fontFamily: "var(--font-family)",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Option A</label>
              <input
                type="text"
                placeholder="Option A text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-grey-border)" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option B</label>
              <input
                type="text"
                placeholder="Option B text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-grey-border)" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option C</label>
              <input
                type="text"
                placeholder="Option C text"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-grey-border)" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option D</label>
              <input
                type="text"
                placeholder="Option D text"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-grey-border)" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", paddingTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label className="form-label" style={{ margin: 0 }}>Correct Answer:</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1.5px solid var(--color-grey-border)",
                  fontWeight: 600,
                  color: "var(--color-navy)"
                }}
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddCustom}
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              Add MCQ to Test
            </button>
          </div>
        </div>
      </div>

      {/* Custom Questions List */}
      {selectedQuestions.some((q) => q.subject === "custom") && (
        <div className="card" style={{ padding: "20px", background: "var(--color-amber-light)", borderColor: "var(--color-amber)" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#92400e" }}>
            ⭐ Added Custom Questions ({selectedQuestions.filter(q => q.subject === "custom").length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {selectedQuestions
              .filter((q) => q.subject === "custom")
              .map((q) => (
                <div
                  key={q.id}
                  style={{
                    background: "white",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(217, 119, 6, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--color-navy)" }}>{q.question}</strong>
                    <div style={{ fontSize: "12px", color: "var(--color-grey-muted)", marginTop: "4px" }}>
                      Correct: Key {q.correctAnswer}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveCustom(q.id)}
                    style={{ fontSize: "12px", padding: "4px 10px" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Available Questions Bank */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", color: "var(--color-navy)" }}>
              Repository Question Picker
            </h3>
            <span style={{ fontSize: "13px", color: "var(--color-grey-muted)" }}>
              Select questions to include in the assessment
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-grey-border)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-navy)"
              }}
            >
              <option value="all">All Domains ({questions.length})</option>
              <option value="core">Core Subjects (OS, DBMS, OOP)</option>
              <option value="dsa">DSA Problems</option>
              <option value="aptitude">General Aptitude</option>
            </select>

            <span className="badge badge-info" style={{ fontSize: "13px", padding: "8px 12px" }}>
              Selected: {selectedQuestions.length}
            </span>
          </div>
        </div>

        <div
          style={{
            maxHeight: "450px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingRight: "8px"
          }}
        >
          {filteredQuestions.map((q, idx) => {
            const isSelected = selectedQuestions.some(
              (sel) => sel.question === q.question
            );

            return (
              <label
                key={q.question || idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: isSelected ? "1.5px solid var(--color-blue)" : "1px solid var(--color-grey-border)",
                  background: isSelected ? "var(--color-blue-badge)" : "var(--color-white)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleSelect(q, e.target.checked)}
                  style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "var(--color-blue)" }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "14px", color: "var(--color-navy)", fontWeight: isSelected ? 600 : 500 }}>
                    {q.question}
                  </span>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <span className="badge badge-neutral" style={{ fontSize: "11px", textTransform: "uppercase" }}>
                      {q.subject || q.category}
                    </span>
                    {q.difficulty && (
                      <span className="badge badge-neutral" style={{ fontSize: "11px" }}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-grey-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: "var(--color-grey-muted)" }}>
            {selectedQuestions.length} total questions selected for mock
          </span>

          <button
            className="btn btn-primary"
            onClick={() => onNext(selectedQuestions)}
            disabled={selectedQuestions.length === 0}
            style={{
              opacity: selectedQuestions.length === 0 ? 0.5 : 1,
              cursor: selectedQuestions.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            Continue to Schedule & Details ({selectedQuestions.length}) →
          </button>
        </div>
      </div>
    </div>
  );
}