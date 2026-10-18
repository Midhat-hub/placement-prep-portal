import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { CalendarIcon, ListOrderedIcon, ClockIcon } from "@/components/Icons";

export default function UpcomingMocksAdmin() {
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMocks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "mockTests"));
        const now = new Date();
        const upcoming = [];

        snapshot.forEach((mockDoc) => {
          const data = mockDoc.data();
          const start = data.startTime?.toDate();

          if (start && now < start) {
            upcoming.push({
              id: mockDoc.id,
              ...data,
            });
          }
        });

        upcoming.sort(
          (a, b) => a.startTime.seconds - b.startTime.seconds
        );

        setMocks(upcoming);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    loadMocks();
  }, []);

  const deleteMock = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete mock test "${title || id}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "mockTests", id));
      setMocks((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete mock test.");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading scheduled mocks…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-hero">
        <div className="admin-hero-icon">
          <CalendarIcon size={26} color="var(--color-white)" />
        </div>
        <div>
          <h1>Upcoming Scheduled Mocks</h1>
          <p>Review test parameters, countdowns, and manage scheduled assessments.</p>
        </div>
        <span className="admin-badge">{mocks.length} Scheduled</span>
      </div>

      {mocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarIcon size={32} color="var(--color-grey-muted)" />
          </div>
          <p>No upcoming mocks scheduled. Use "Create Mock Test" to publish a new one.</p>
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
                    {mock.duration} min
                  </span>
                )}
                <span>
                  Starts: {mock.startTime?.toDate().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span>
                  Ends: {mock.endTime?.toDate().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            </div>

            <div className="mock-card-actions">
              <span className="badge badge-info">Scheduled</span>
              <button
                className="btn btn-danger"
                onClick={() => deleteMock(mock.id, mock.title)}
                style={{ fontSize: "13px", padding: "8px 14px" }}
              >
                Delete Mock
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}