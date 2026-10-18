import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { FolderIcon, ListOrderedIcon, ClockIcon } from "@/components/Icons";

export default function AdminPreviousMocks() {
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMocks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "mockTests"));
        const now = new Date();
        const previous = [];

        snapshot.forEach((mockDoc) => {
          const data = mockDoc.data();
          const end = data.endTime?.toDate();

          if (end && now > end) {
            previous.push({
              id: mockDoc.id,
              ...data,
            });
          }
        });

        previous.sort(
          (a, b) => b.endTime.seconds - a.endTime.seconds
        );

        setMocks(previous);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    loadMocks();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading archived mocks…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-hero">
        <div className="admin-hero-icon">
          <FolderIcon size={26} color="var(--color-white)" />
        </div>
        <div>
          <h1>Archived Mock Tests</h1>
          <p>Review completed tests, questions, and evaluate assessment metrics.</p>
        </div>
        <span className="admin-badge">{mocks.length} Completed</span>
      </div>

      {mocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderIcon size={32} color="var(--color-grey-muted)" />
          </div>
          <p>No completed mocks recorded in the database yet.</p>
        </div>
      ) : (
        mocks.map((mock) => (
          <div key={mock.id} className="mock-card">
            <div className="mock-card-info">
              <div className="mock-card-title">{mock.title}</div>
              <div className="mock-card-meta">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <ListOrderedIcon size={14} color="var(--color-grey-muted)" />
                  {mock.questionCount} Questions
                </span>
                {mock.duration && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <ClockIcon size={14} color="var(--color-grey-muted)" />
                    {mock.duration} min duration
                  </span>
                )}
                <span>
                  Ended: {mock.endTime?.toDate().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            </div>

            <div className="mock-card-actions">
              <span className="badge badge-neutral">Archived</span>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/mock-review/${mock.id}`)}
                style={{ fontSize: "13px", padding: "8px 14px" }}
              >
                Review Test Items →
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}