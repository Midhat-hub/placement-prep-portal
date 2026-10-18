import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

function DSACodingPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const snapshot = await getDocs(collection(db, "coding_questions"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(data);
      } catch (error) {
        console.error("Error loading coding questions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const categories = useMemo(() => [
    "All",
    ...new Set(questions.map((q) => q.category).filter(Boolean)),
  ], [questions]);

  const difficulties = useMemo(() => [
    "All",
    ...new Set(questions.map((q) => q.difficulty).filter(Boolean)),
  ], [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const categoryMatch =
        selectedCategory === "All" || q.category === selectedCategory;

      const difficultyMatch =
        selectedDifficulty === "All" ||
        (q.difficulty || "").toLowerCase() === selectedDifficulty.toLowerCase();

      const searchMatch = !search.trim() ||
        (q.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (q.category || "").toLowerCase().includes(search.toLowerCase());

      return categoryMatch && difficultyMatch && searchMatch;
    });
  }, [questions, selectedCategory, selectedDifficulty, search]);

  const getDifficultyBadge = (diff) => {
    const d = (diff || "").toLowerCase();
    if (d === "easy") return "badge-success";
    if (d === "medium") return "badge-warning";
    if (d === "hard") return "badge-error";
    return "badge-neutral";
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/practice/dsa")}
          style={{ fontSize: "12px", padding: "6px 14px", marginBottom: "12px" }}
        >
          ← Back to DSA Hub
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em" }}>
              Algorithmic Problem Solving
            </span>
            <h1 className="page-heading" style={{ margin: "4px 0 0 0" }}>
              DSA Coding Challenges
            </h1>
          </div>

          <span className="badge badge-info" style={{ fontSize: "13px", padding: "8px 14px" }}>
            {filteredQuestions.length} Problems Available
          </span>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="card" style={{ padding: "18px 24px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search problems by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--color-grey-border)",
              fontSize: "13px",
              minWidth: "240px",
              flex: 1,
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--color-grey-border)",
              fontSize: "13px",
              background: "white",
              color: "var(--color-navy)",
              fontWeight: 600,
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Topics & Patterns" : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--color-grey-border)",
              fontSize: "13px",
              background: "white",
              color: "var(--color-navy)",
              fontWeight: 600,
            }}
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff === "All" ? "All Difficulties" : diff}
              </option>
            ))}
          </select>

          {(search || selectedCategory !== "All" || selectedDifficulty !== "All") && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedDifficulty("All");
              }}
              style={{ fontSize: "12px", padding: "8px 12px" }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      {loading ? (
        <div className="card" style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading coding challenges…</span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>#</th>
                  <th>Problem Title</th>
                  <th style={{ width: "180px" }}>Category</th>
                  <th style={{ width: "120px" }}>Difficulty</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "36px", color: "var(--color-grey-muted)" }}>
                      No coding problems found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, i) => (
                    <tr
                      key={q.id || i}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/practice/dsa-coding/${q.id}`)}
                    >
                      <td style={{ textAlign: "center", color: "var(--color-grey-muted)", fontWeight: 600 }}>
                        {i + 1}
                      </td>

                      <td className="question-col" style={{ fontWeight: 600, color: "var(--color-navy)" }}>
                        {q.title}
                      </td>

                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: "12px" }}>
                          {q.category || "General"}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty || "Medium"}
                        </span>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: "12px", padding: "6px 14px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/practice/dsa-coding/${q.id}`);
                          }}
                        >
                          Code IDE
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DSACodingPage;
