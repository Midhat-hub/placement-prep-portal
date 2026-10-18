import { useMemo, useState } from "react";
import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";
import { HelpCircleIcon, SearchIcon, CheckCircleIcon } from "@/components/Icons";

export default function QuestionBank() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const questions = useMemo(() => {
    const all = [
      ...core.map((q) => ({
        ...q,
        category: "core",
      })),
      ...dsa.map((q) => ({
        ...q,
        category: "dsa",
      })),
      ...aptitude.map((q) => ({
        ...q,
        category: "aptitude",
      })),
    ];

    return all.filter((q) => {
      const matchesSearch = q.question
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || q.category === category;

      const matchesDifficulty =
        difficulty === "all" ||
        (q.difficulty || "").toLowerCase() === difficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, category, difficulty]);

  const getDifficultyBadge = (diff) => {
    const d = (diff || "").toLowerCase();
    if (d === "easy") return "badge-success";
    if (d === "medium") return "badge-warning";
    if (d === "hard") return "badge-error";
    return "badge-neutral";
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-hero">
        <div className="admin-hero-icon">
          <HelpCircleIcon size={26} color="var(--color-white)" />
        </div>
        <div>
          <h1>Central Question Bank</h1>
          <p>Search, filter, and review questions across all curriculum domains.</p>
        </div>
        <span className="admin-badge">{questions.length} Questions</span>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search questions by keywords…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Domains (DSA, Core, Aptitude)</option>
          <option value="core">Core Subjects (OS, DBMS, OOP, CN)</option>
          <option value="dsa">Data Structures & Algorithms</option>
          <option value="aptitude">General Aptitude</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {(search || category !== "all" || difficulty !== "all") && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setDifficulty("all");
            }}
            style={{ fontSize: "13px", padding: "8px 14px" }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <SearchIcon size={32} color="var(--color-grey-muted)" />
          </div>
          <p>No questions matched your current filter criteria.</p>
        </div>
      ) : (
        <div>
          {questions.map((q, index) => (
            <details key={index} className="qb-item">
              <summary>
                <span style={{ fontWeight: 700, color: "var(--color-blue)", minWidth: "28px" }}>
                  #{index + 1}
                </span>
                <span style={{ flex: 1 }}>{q.question}</span>
                <span className={`badge ${getDifficultyBadge(q.difficulty)}`}>
                  {q.difficulty || "Standard"}
                </span>
              </summary>

              <div className="qb-item-body">
                <div className="qb-meta">
                  <span className="badge badge-info" style={{ textTransform: "uppercase" }}>
                    Category: {q.category}
                  </span>
                  {q.topic && (
                    <span className="badge badge-neutral">
                      Topic: {q.topic}
                    </span>
                  )}
                  {q.subject && (
                    <span className="badge badge-neutral">
                      Subject: {q.subject}
                    </span>
                  )}
                </div>

                {q.options && (
                  <div className="qb-options">
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-navy)", marginBottom: "4px" }}>
                      Options:
                    </span>
                    {Array.isArray(q.options)
                      ? q.options.map((opt, i) => (
                          <div
                            key={i}
                            className="qb-option"
                            style={{
                              borderColor: opt === q.answer ? "var(--color-green)" : "var(--color-grey-border)",
                              background: opt === q.answer ? "var(--color-green-light)" : "var(--color-white)",
                              fontWeight: opt === q.answer ? 600 : 400
                            }}
                          >
                            <span>{String.fromCharCode(65 + i)}.</span> {opt}
                          </div>
                        ))
                      : Object.entries(q.options).map(([key, val]) => (
                          <div
                            key={key}
                            className="qb-option"
                            style={{
                              borderColor: key === q.correctAnswer || val === q.answer ? "var(--color-green)" : "var(--color-grey-border)",
                              background: key === q.correctAnswer || val === q.answer ? "var(--color-green-light)" : "var(--color-white)",
                              fontWeight: key === q.correctAnswer || val === q.answer ? 600 : 400
                            }}
                          >
                            <span>{key}:</span> {val}
                          </div>
                        ))}
                  </div>
                )}

                <div style={{ marginTop: "12px" }}>
                  <span className="qb-answer" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircleIcon size={14} color="var(--color-green)" />
                    Correct Answer: {q.answer || q.correctAnswer}
                  </span>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}