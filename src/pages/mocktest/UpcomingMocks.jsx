import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UpcomingMocks() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("mockTests")) || [];
    const now = new Date();
    const upcoming = all.filter((t) => t.end && new Date(t.end) > now);
    setTests(upcoming);
  }, []);

  const startTest = (test) => {
    const now = new Date();
    const startTime = test.start ? new Date(test.start) : null;
    if (startTime && now < startTime) {
      alert("Test will be available at " + startTime.toLocaleString());
      return;
    }
    localStorage.setItem("mockQuestions", JSON.stringify(test.questions));
    localStorage.setItem("currentTest", JSON.stringify(test));
    navigate("/test");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upcoming TPC Organized Mocks</h2>
      {tests.length === 0 && <p>No upcoming TPC mocks.</p>}
      {tests.map((test) => (
        <div key={test.id} style={{ padding: "15px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "10px" }}>
          <h3>{test.title}</h3>
          <p>Questions: {test.questions?.length || 0}</p>
          <p><b>Starts:</b> {test.start ? new Date(test.start).toLocaleString() : "-"}</p>
          <p><b>Ends:</b> {test.end ? new Date(test.end).toLocaleString() : "-"}</p>
          {(() => {
            const now = new Date();
            const startTime = test.start ? new Date(test.start) : null;
            const isAvailable = !startTime || now >= startTime;
            return (
              <>
                <button
                  onClick={() => startTest(test)}
                  disabled={!isAvailable}
                  style={{
                    padding: "8px 15px",
                    cursor: isAvailable ? "pointer" : "not-allowed",
                    opacity: isAvailable ? 1 : 0.5,
                    backgroundColor: isAvailable ? "#4CAF50" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px"
                  }}
                >
                  Start Test
                </button>
                {!isAvailable && (
                  <p style={{ color: "#ff6b6b", fontSize: "12px" }}>
                    Available at {startTime.toLocaleString()}
                  </p>
                )}
              </>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
