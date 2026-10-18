import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { CalendarIcon, ListOrderedIcon, ClockIcon } from "@/components/Icons";

export default function UpcomingMocks() {
  const [tests, setTests] = useState([]);
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

        setTests(upcoming);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    loadMocks();
    const interval = setInterval(loadMocks, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (startTime) => {
    const now = new Date();
    const diff = startTime - now;

    if (diff <= 0) return "Starting soon";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="mock-list-page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading upcoming mocks…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-list-page">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <CalendarIcon size={22} color="var(--color-navy)" />
        Upcoming Mock Tests
      </h1>

      {tests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarIcon size={32} color="var(--color-grey-muted)" />
          </div>
          <p>No upcoming mocks scheduled at the moment. Please check back later.</p>
        </div>
      ) : (
        tests.map((test) => (
          <div key={test.id} className="mock-card">
            <div className="mock-card-info">
              <div className="mock-card-title">{test.title}</div>
              <div className="mock-card-meta">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <ListOrderedIcon size={14} color="var(--color-grey-muted)" />
                  {test.questionCount} Questions
                </span>
                {test.duration && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <ClockIcon size={14} color="var(--color-grey-muted)" />
                    {test.duration} min
                  </span>
                )}
                <span>
                  Starts: {test.startTime?.toDate().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span>
                  Ends: {test.endTime?.toDate().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            </div>

            <div className="mock-card-actions">
              <span className="badge badge-info">Upcoming</span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-navy)",
                  background: "var(--color-grey-bg)",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-grey-border)",
                  whiteSpace: "nowrap"
                }}
              >
                ⏳ In {getTimeRemaining(test.startTime.toDate())}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}