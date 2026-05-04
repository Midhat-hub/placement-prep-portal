import { useState } from "react";
import { useNavigate } from "react-router-dom";

import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";

export default function PracticeTest() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("all");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);

  const loadQuestions = () => {
    setLoading(true);

    // Get questions based on subject
    let questions = [];
    if (subject === "core") {
      questions = [...core];
    } else if (subject === "dsa") {
      questions = [...dsa];
    } else {
      // All
      questions = [...core, ...dsa, ...aptitude];
    }

    // Shuffle questions
    const shuffled = questions.sort(() => 0.5 - Math.random());

    // Pick selected number of questions
    const selected = shuffled.slice(0, Math.min(numQuestions, questions.length));

    // Calculate timer: 10 minutes + (number of questions) minutes
    const timerMinutes = 10 + selected.length;


    // Create practice test object
    const practiceTest = {
      id: Date.now(),
      title: `Practice Test - ${subject.toUpperCase()}`,
      time: timerMinutes,
      isPractice: true
    };

    // Store questions
    localStorage.setItem("mockQuestions", JSON.stringify(selected));  
    localStorage.setItem("currentTest", JSON.stringify(practiceTest));

    // Navigate to test page
    navigate("/test");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Practice Test Configuration</h2>

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
        <label>
          <b>Select Subject:</b>
        </label>
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <label>
            <input
              type="radio"
              value="core"
              checked={subject === "core"}
              onChange={(e) => setSubject(e.target.value)}
            />
            Core (OS/DBMS/OOPS)
          </label>
          <label>
            <input
              type="radio"
              value="dsa"
              checked={subject === "dsa"}
              onChange={(e) => setSubject(e.target.value)}
            />
            DSA
          </label>
          <label>
            <input
              type="radio"
              value="all"
              checked={subject === "all"}
              onChange={(e) => setSubject(e.target.value)}
            />
            All
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
        <label>
          <b>Number of Questions:</b>
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            padding: "10px",
            width: "100%",
            marginTop: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "10px" }}>
        <b>Test Duration:</b>
        <p style={{ marginTop: "10px", fontSize: "18px", color: "#2e7d32" }}>
          {10 + numQuestions} minutes (10 min + {numQuestions} min)
        </p>
      </div>

      <button
        onClick={loadQuestions}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#ccc" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold"
        }}
      >
        {loading ? "Starting..." : "Start Practice Test"}
      </button>
    </div>
  );
}