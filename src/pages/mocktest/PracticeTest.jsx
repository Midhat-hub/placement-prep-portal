import { useState } from "react";
import { useNavigate } from "react-router-dom";
import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";
import { GlobeIcon, CpuIcon, ZapIcon, BrainIcon } from "@/components/Icons";

export default function PracticeTest() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("all");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadQuestions = () => {
    setLoading(true);

    let questions = [];
    if (subject === "core") {
      questions = [...core];
    } else if (subject === "dsa") {
      questions = [...dsa];
    } else if (subject === "aptitude") {
      questions = [...aptitude];
    } else {
      questions = [...core, ...dsa, ...aptitude];
    }

    const shuffled = shuffleArray(questions);
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

    const practiceTest = {
      id: Date.now(),
      title: `Practice Test — ${subject.toUpperCase()}`,
      time: numQuestions,
      isPractice: true,
    };

    localStorage.removeItem("mockQuestions");
    localStorage.removeItem("currentTest");
    localStorage.setItem("mockQuestions", JSON.stringify(selected));
    localStorage.setItem("currentTest", JSON.stringify(practiceTest));

    navigate("/practice-test-page", { replace: true });
  };

  const subjects = [
    { id: "all", label: "Full Syllabus (All Topics)", icon: <GlobeIcon size={20} color="var(--color-navy)" />, desc: "Balanced blend of Core, DSA, and General Aptitude" },
    { id: "core", label: "Core Subjects", icon: <CpuIcon size={20} color="var(--color-navy)" />, desc: "Operating Systems, DBMS, Computer Networks & OOP" },
    { id: "dsa", label: "Data Structures & Algorithms", icon: <ZapIcon size={20} color="var(--color-navy)" />, desc: "Arrays, Trees, Graphs, Sorting, and Dynamic Programming" },
    { id: "aptitude", label: "General Aptitude", icon: <BrainIcon size={20} color="var(--color-navy)" />, desc: "Quantitative, Logical Reasoning, and Verbal Ability" },
  ];

  const counts = [5, 10, 15, 20, 25];

  return (
    <div className="page" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="card" style={{ padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em" }}>
            Self-Paced Practice
          </span>
          <h1 className="page-heading" style={{ margin: "4px 0 8px 0" }}>
            Configure Practice Mock
          </h1>
          <p style={{ color: "var(--color-grey-muted)", fontSize: "14px", margin: 0 }}>
            Generate an instant, timed randomized assessment from our verified question bank.
          </p>
        </div>

        {/* Subject Selection Grid */}
        <div style={{ marginBottom: "28px" }}>
          <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>
            Select Subject Domain
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {subjects.map((s) => {
              const isSelected = subject === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSubject(s.id)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "var(--radius-md)",
                    border: isSelected ? "2px solid var(--color-blue)" : "1.5px solid var(--color-grey-border)",
                    background: isSelected ? "var(--color-blue-badge)" : "var(--color-white)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{s.icon}</span>
                  <div>
                    <strong style={{ color: "var(--color-navy)", fontSize: "14px", display: "block" }}>
                      {s.label}
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--color-grey-muted)" }}>
                      {s.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Number of Questions Selector */}
        <div style={{ marginBottom: "36px" }}>
          <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>
            Question Count & Timer ({numQuestions} questions • {numQuestions} minutes)
          </label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {counts.map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setNumQuestions(cnt)}
                style={{
                  flex: 1,
                  minWidth: "60px",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: numQuestions === cnt ? "2px solid var(--color-blue)" : "1.5px solid var(--color-grey-border)",
                  background: numQuestions === cnt ? "var(--color-navy)" : "var(--color-white)",
                  color: numQuestions === cnt ? "var(--color-white)" : "var(--color-grey-text)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {cnt} Qs
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid var(--color-grey-border)" }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/mocktest")}
          >
            ← Back to Hub
          </button>

          <button
            className="btn btn-primary"
            onClick={loadQuestions}
            disabled={loading}
            style={{ padding: "12px 28px", fontSize: "15px" }}
          >
            {loading ? "Generating Test…" : "Start Practice Session"}
          </button>
        </div>
      </div>
    </div>
  );
}