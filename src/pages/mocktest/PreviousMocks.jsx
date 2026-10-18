import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { FolderIcon, ListOrderedIcon } from "@/components/Icons";

export default function PreviousMocks() {
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMocks = async () => {
      try {
        const now = new Date();
        const snapshot = await getDocs(collection(db, "mockTests"));
        const mockList = [];

        for (const mockDoc of snapshot.docs) {
          const mockData = mockDoc.data();
          const endTime = mockData.endTime?.toDate();

          // only completed mocks
          if (endTime && now > endTime) {
            let attemptData = null;
            const user = auth.currentUser;

            if (user) {
              const attemptRef = doc(
                db,
                "user_progress",
                user.uid,
                "mock_tests",
                mockDoc.id
              );
              const attemptSnap = await getDoc(attemptRef);
              if (attemptSnap.exists()) {
                attemptData = attemptSnap.data();
              }
            }

            mockList.push({
              id: mockDoc.id,
              ...mockData,
              attempt: attemptData,
            });
          }
        }

        setMocks(mockList);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    loadMocks();
  }, []);

  if (loading) {
    return (
      <div className="mock-list-page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading previous mocks…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-list-page">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <FolderIcon size={22} color="var(--color-navy)" />
        Previous Mock Tests
      </h1>

      {mocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderIcon size={32} color="var(--color-grey-muted)" />
          </div>
          <p>No completed mock tests found.</p>
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
                {mock.endTime && (
                  <span>
                    Ended: {mock.endTime.toDate().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                )}
                {mock.attempt ? (
                  <span style={{ color: "var(--color-green)", fontWeight: 600 }}>
                    Score: {mock.attempt.score} / {mock.attempt.totalQuestions || mock.questionCount}
                  </span>
                ) : (
                  <span style={{ color: "var(--color-amber)", fontWeight: 500 }}>
                    Not Attempted
                  </span>
                )}
              </div>
            </div>

            <div className="mock-card-actions">
              {mock.attempt ? (
                <span className="badge badge-success">Attempted</span>
              ) : (
                <span className="badge badge-warning">Missed</span>
              )}

              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/mock-review/${mock.id}`)}
              >
                Review Test
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}