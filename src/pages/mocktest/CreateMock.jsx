import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";

export default function CreateMock() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [category, setCategory] = useState("all");
  const [time, setTime] = useState("");
  const [instructions, setInstructions] = useState("");

  const navigate = useNavigate();

  // Load all questions with proper subject tagging
  useEffect(() => {
    const allQuestions = [
      ...core.map((q) => ({ ...q, subject: q.subject || "core" })),
      ...dsa.map((q) => ({ ...q, subject: "dsa" })),
      ...aptitude.map((q) => ({ ...q, subject: "aptitude" })),
    ];

    setQuestions(allQuestions);
  }, []);

  // Handle checkbox selection
  const handleSelect = (question, isChecked) => {
    if (isChecked) {
      setSelectedQuestions((prev) => [...prev, question]);
    } else {
      setSelectedQuestions((prev) =>
        prev.filter((q) => q.question !== question.question)
      );
    }
  };

  const handleCreateTest = () => {
  if (!title) {
    alert("Please enter test title");
    return;
  }

  if (selectedQuestions.length === 0) {
    alert("Please select at least 1 question");
    return;
  }

  const newTest = {
  id: Date.now(),
  title: title,
  questions: selectedQuestions,
  time: time, // ⏱️ added
  instructions: instructions, // 📜 added
  createdAt: new Date().toISOString(),
};

  // Get existing tests
  const existing = JSON.parse(localStorage.getItem("mockTests")) || [];

  // Save new test
  existing.push(newTest);
  localStorage.setItem("mockTests", JSON.stringify(existing));

  alert("Mock Test Created Successfully!");

  // optional: reset
  setTitle("");
  setSelectedQuestions([]);
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Mock Test</h2>

      {/* TITLE INPUT */}
      <input
        type="text"
        placeholder="Enter Test Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      {/* TIME INPUT */}
<br /><br />
<input
  type="number"
  placeholder="Enter Time (in minutes)"
  value={time}
  onChange={(e) => setTime(e.target.value)}
  style={{ padding: "10px", width: "200px" }}
/>

{/* INSTRUCTIONS */}
<br /><br />
<textarea
  placeholder="Enter Instructions"
  value={instructions}
  onChange={(e) => setInstructions(e.target.value)}
  rows="4"
  style={{ padding: "10px", width: "300px" }}
/>

      <button
  onClick={handleCreateTest}
  style={{
    marginTop: "15px",
    padding: "10px 20px",
    cursor: "pointer"
  }}
>
  Create Test
</button>

      {/* CATEGORY FILTER */}
      <div style={{ marginTop: "20px" }}>
        <label><b>Select Category: </b></label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "10px", marginLeft: "10px" }}
        >
          <option value="all">All</option>
          <option value="core">Core (OS/DBMS/OOPS)</option>
          <option value="dsa">DSA</option>
          <option value="aptitude">Aptitude</option>
        </select>
      </div>

      {/* SELECTED COUNT */}
      <h3 style={{ marginTop: "20px" }}>
        Selected Questions: {selectedQuestions.length}
      </h3>

      {/* QUESTIONS LIST */}
      <h3 style={{ marginTop: "20px" }}>All Questions:</h3>

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

          if (category === "dsa") {
            return subject === "dsa";
          }

          if (category === "aptitude") {
            return subject === "aptitude";
          }

          return true;
        })
        .map((q, i) => (
          <div key={i} style={{ marginBottom: "15px" }}>
            <input
              type="checkbox"
              onChange={(e) => handleSelect(q, e.target.checked)}
            />
            <b>{i + 1}. {q.question}</b>
          </div>
        ))}
    </div>
  );
}