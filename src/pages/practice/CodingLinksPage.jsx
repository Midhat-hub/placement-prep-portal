import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";

function CodingLinksPage() {
  const { company } = useParams();
  const navigate = useNavigate();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLinks() {
      setLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        let progressMap = {};

        if (userId) {
          try {
            const progressSnapshot = await getDocs(
              collection(db, "user_progress", userId, "coding")
            );
            progressSnapshot.forEach((doc) => {
              progressMap[doc.id] = doc.data();
            });
          } catch (e) {
            console.warn("Could not load user progress:", e);
          }
        }

        const snapshot = await getDocs(
          collection(db, "company_prep", company, "items")
        );

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          completed: progressMap[d.id]?.completed || false,
        }));

        setLinks(data);
      } catch (error) {
        console.error("Error loading company coding links:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLinks();
  }, [company]);

  async function toggleComplete(id, current) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Please sign in to save your completion progress.");
      return;
    }

    try {
      await setDoc(
        doc(db, "user_progress", userId, "coding", id),
        {
          completed: !current,
          completedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setLinks((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, completed: !current } : p
        )
      );
    } catch (e) {
      console.error("Error updating progress:", e);
    }
  }

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const term = search.toLowerCase();
    return links.filter((l) =>
      (l.problem || "").toLowerCase().includes(term) ||
      (l.platform || "").toLowerCase().includes(term)
    );
  }, [links, search]);

  const companyFormatted = company ? company.charAt(0).toUpperCase() + company.slice(1) : "Company";
  const completedCount = links.filter((l) => l.completed).length;

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
              Coding Tracks
            </span>
            <h1 className="page-heading" style={{ margin: "4px 0 0 0" }}>
              {companyFormatted} Coding Problems
            </h1>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search problems…"
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
            <span className="badge badge-success" style={{ fontSize: "12px", padding: "8px 12px" }}>
              {completedCount} of {links.length} Solved
            </span>
          </div>
        </div>
      </div>

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
                  <th style={{ width: "50px", textAlign: "center" }}>#</th>
                  <th>Problem Title</th>
                  <th style={{ width: "150px" }}>Platform</th>
                  <th style={{ width: "140px", textAlign: "center" }}>Practice Link</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Progress</th>
                </tr>
              </thead>

              <tbody>
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "36px", color: "var(--color-grey-muted)" }}>
                      No problems found.
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((q, i) => (
                    <tr key={q.id || i}>
                      <td style={{ textAlign: "center", color: "var(--color-grey-muted)", fontWeight: 600 }}>
                        {i + 1}
                      </td>

                      <td className="question-col" style={{ fontWeight: 600, color: "var(--color-navy)" }}>
                        {q.problem}
                      </td>

                      <td>
                        <span className="badge badge-info" style={{ fontSize: "12px" }}>
                          {q.platform || "Platform"}
                        </span>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {q.link ? (
                          <a
                            href={q.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{
                              fontSize: "12px",
                              padding: "5px 12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "none",
                            }}
                          >
                            Solve ↗
                          </a>
                        ) : (
                          <span style={{ color: "var(--color-grey-muted)" }}>—</span>
                        )}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <button
                          className={q.completed ? "btn btn-primary" : "btn btn-secondary"}
                          onClick={() => toggleComplete(q.id, q.completed)}
                          style={{
                            fontSize: "12px",
                            padding: "5px 12px",
                            background: q.completed ? "var(--color-green)" : undefined,
                            borderColor: q.completed ? "var(--color-green)" : undefined,
                          }}
                        >
                          {q.completed ? "Solved" : "Mark Done"}
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

export default CodingLinksPage;