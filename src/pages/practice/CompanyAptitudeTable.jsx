import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";
import { CheckCircleIcon } from "@/components/Icons";

function CompanyAptitudeTable() {
  const { company } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        let progressMap = {};

        if (userId) {
          try {
            const progressSnapshot = await getDocs(
              collection(db, "user_progress", userId, "attempts")
            );
            progressSnapshot.forEach((doc) => {
              progressMap[doc.id] = doc.data();
            });
          } catch (e) {
            console.warn("Could not load user progress:", e);
          }
        }

        const snapshot = await getDocs(
          collection(db, "company_prep", "company_aptitude", "items")
        );

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          progress: progressMap[doc.id] || null,
        }));

        const filtered = data.filter(
          (q) => (q.company || "").toLowerCase() === (company || "").toLowerCase()
        );

        setQuestions(filtered);
      } catch (error) {
        console.error("Error loading company aptitude questions:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [company]);

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return questions;
    const term = search.toLowerCase();
    return questions.filter((q) =>
      (q.question || "").toLowerCase().includes(term) ||
      (q.difficulty || "").toLowerCase().includes(term)
    );
  }, [questions, search]);

  const getDifficultyBadge = (diff) => {
    const d = (diff || "").toLowerCase();
    if (d === "easy") return "badge-success";
    if (d === "medium") return "badge-warning";
    if (d === "hard") return "badge-error";
    return "badge-neutral";
  };

  const companyFormatted = company ? company.charAt(0).toUpperCase() + company.slice(1) : "Company";

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/practice/company/${company}`)}
          style={{ fontSize: "12px", padding: "6px 14px", marginBottom: "12px" }}
        >
          ← Back to {companyFormatted} Overview
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em" }}>
              Aptitude & Technical MCQs
            </span>
            <h1 className="page-heading" style={{ margin: "4px 0 0 0" }}>
              {companyFormatted} Aptitude Questions
            </h1>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Filter questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-grey-border)",
                fontSize: "13px",
                width: "200px",
              }}
            />
            <span className="badge badge-info" style={{ fontSize: "12px", padding: "8px 12px" }}>
              {filteredQuestions.length} Questions
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading aptitude questions…</span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>#</th>
                  <th>Question</th>
                  <th style={{ width: "110px" }}>Difficulty</th>
                  <th style={{ width: "100px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "90px", textAlign: "center" }}>Accuracy</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Time</th>
                  <th style={{ width: "90px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "var(--color-grey-muted)" }}>
                      No questions found for this company.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, i) => (
                    <tr
                      key={q.id || i}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/practice/question/company_aptitude/${q.id}`)}
                    >
                      <td style={{ textAlign: "center", color: "var(--color-grey-muted)", fontWeight: 600 }}>
                        {i + 1}
                      </td>

                      <td className="question-col" style={{ fontWeight: 500, color: "var(--color-navy)" }}>
                        {q.question}
                      </td>

                      <td>
                        <span className={`badge ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty || "Medium"}
                        </span>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {q.progress ? (
                          <span style={{ color: "var(--color-green)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircleIcon size={14} color="var(--color-green)" />
                            Solved
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-grey-muted)" }}>—</span>
                        )}
                      </td>

                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {q.progress ? (
                          <span style={{ color: q.progress.correct ? "var(--color-green)" : "var(--color-red)" }}>
                            {q.progress.correct ? "100%" : "0%"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td style={{ textAlign: "center", color: "var(--color-grey-muted)", fontSize: "13px" }}>
                        {q.progress?.timeTaken ? `${q.progress.timeTaken}s` : "—"}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: "11px", padding: "5px 10px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/practice/question/company_aptitude/${q.id}`);
                          }}
                        >
                          Solve →
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

export default CompanyAptitudeTable;