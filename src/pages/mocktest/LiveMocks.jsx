import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { RadioIcon, FileTextIcon, ListOrderedIcon, ClockIcon } from "@/components/Icons";

export default function LiveMocks() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMocks = async () => {
      try {
        const snap = await getDocs(collection(db, "mockTests"));
        const now  = new Date();
        const live = [];

        snap.forEach((mockDoc) => {
          const data  = mockDoc.data();
          const start = data.startTime?.toDate();
          const end   = data.endTime?.toDate();
          if (start && end && now >= start && now <= end) {
            live.push({ id: mockDoc.id, ...data });
          }
        });

        setTests(live);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    loadMocks();
    const interval = setInterval(loadMocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const startTest = async (test) => {
    try {
      const user = auth.currentUser;
      if (!user) { alert("Please login first."); return; }

      const now = new Date();
      const end = test.endTime?.toDate();
      if (end && now > end) { alert("This mock has ended."); return; }

      const attemptRef  = doc(db, "user_progress", user.uid, "mock_tests", test.id);
      const attemptSnap = await getDoc(attemptRef);
      if (attemptSnap.exists()) { alert("You have already attempted this mock."); return; }

      navigate(`/test/${test.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="mock-list-page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading live mocks…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-list-page">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <RadioIcon size={22} color="#ef4444" />
        Live Mock Tests
      </h1>

      {tests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileTextIcon size={32} color="var(--color-grey-muted)" />
          </div>
          <p>No live mocks running right now. Check back soon!</p>
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <ClockIcon size={14} color="var(--color-grey-muted)" />
                  {test.duration} min
                </span>
                {test.endTime && (
                  <span>Ends: {test.endTime.toDate().toLocaleTimeString()}</span>
                )}
              </div>
            </div>
            <div className="mock-card-actions">
              <span className="badge badge-error">Live</span>
              <button
                className="btn btn-primary"
                onClick={() => startTest(test)}
              >
                Start Test
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}