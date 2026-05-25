import { useEffect, useState } from "react";
import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";

export default function SelectQuestions({ onNext }) {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [category, setCategory] = useState("all");
  const [customQuestion, setCustomQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

  useEffect(() => {
    const allQuestions = [
      ...core.map((q) => ({ ...q, subject: q.subject || "core" })),
      ...dsa.map((q) => ({ ...q, subject: "dsa" })),
      ...aptitude.map((q) => ({ ...q, subject: "aptitude" })),
    ];
    setQuestions(allQuestions);
  }, []);

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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Step 1: Select Questions</h2>

      {/* Custom Question Input */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h4>Add Custom MCQ Question</h4>
        <div style={{ marginBottom: "15px" }}>
          <label><b>Question:</b></label>
          <textarea
            placeholder="Enter your question here"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            rows="3"
            style={{ padding: "10px", width: "100%", maxWidth: "400px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><b>Option A:</b></label>
          <input
            type="text"
            placeholder="Enter option A"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            style={{ padding: "8px", width: "100%", maxWidth: "400px", display: "block", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><b>Option B:</b></label>
          <input
            type="text"
            placeholder="Enter option B"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            style={{ padding: "8px", width: "100%", maxWidth: "400px", display: "block", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><b>Option C:</b></label>
          <input
            type="text"
            placeholder="Enter option C"
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
            style={{ padding: "8px", width: "100%", maxWidth: "400px", display: "block", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><b>Option D:</b></label>
          <input
            type="text"
            placeholder="Enter option D"
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
            style={{ padding: "8px", width: "100%", maxWidth: "400px", display: "block", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><b>Correct Answer:</b></label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            style={{ padding: "8px", marginLeft: "10px" }}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <button
          onClick={handleAddCustom}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Add MCQ
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <b>Select Category: </b>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "10px", marginLeft: "10px" }}
        >
          <option value="all">All</option>
          <option value="core">Core (OS/DBMS/OOPS)</option>
          <option value="dsa">DSA</option>
          <option value="aptitude">Aptitude</option>
          <option value="custom">Custom Questions</option>
        </select>
      </div>

      {/* Selected Count */}
      <h3>Selected Questions: {selectedQuestions.length}</h3>

      {/* Questions List */}
      <h3>Available Questions:</h3>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "20px" }}>
        {questions
          .filter((q) => {
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
          })
          .map((q) => (
            <div key={q.question} style={{ marginBottom: "15px", padding: "10px" }}>
              <input
                type="checkbox"
                checked={selectedQuestions.some(
                  (selected) => selected.question === q.question
                )}
                onChange={(e) => handleSelect(q, e.target.checked)}
              />
              <b style={{ marginLeft: "10px" }}>{q.question}</b>
              <span style={{ marginLeft: "10px", fontSize: "12px", color: "#666" }}>
                ({q.subject})
              </span>
            </div>
          ))}
      </div>

      {/* Custom Questions Display */}
      {selectedQuestions.some((q) => q.subject === "custom") && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
          }}
        >
          <h3>Your Custom Questions:</h3>
          {selectedQuestions
            .filter((q) => q.subject === "custom")
            .map((q) => (
              <div
                key={q.id}
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#fff",
                  border: "1px solid #ffc107",
                  borderRadius: "4px",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <b>{q.question}</b>
                </div>
                <div style={{ marginLeft: "15px", marginBottom: "10px" }}>
                  <div>A. {q.options?.A} {q.correctAnswer === "A" ? "✓" : ""}</div>
                  <div>B. {q.options?.B} {q.correctAnswer === "B" ? "✓" : ""}</div>
                  <div>C. {q.options?.C} {q.correctAnswer === "C" ? "✓" : ""}</div>
                  <div>D. {q.options?.D} {q.correctAnswer === "D" ? "✓" : ""}</div>
                </div>
                <button
                  onClick={() => handleRemoveCustom(q.id)}
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => onNext(selectedQuestions)}
          disabled={selectedQuestions.length === 0}
          style={{
            padding: "10px 20px",
            cursor: selectedQuestions.length === 0 ? "not-allowed" : "pointer",
            opacity: selectedQuestions.length === 0 ? 0.5 : 1,
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}