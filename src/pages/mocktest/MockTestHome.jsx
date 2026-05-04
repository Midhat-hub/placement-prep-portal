import { useNavigate } from "react-router-dom";

export default function MockTestHome() {
  const navigate = useNavigate();
  const tests = JSON.parse(localStorage.getItem("mockTests")) || [];
  const now = new Date();
  const upcoming = tests.filter((t) => t.end && new Date(t.end) > now);
  const previous = tests.filter((t) => t.end && new Date(t.end) <= now);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Mock Test Hub</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "30px",
        marginTop: "40px"
      }}>

        <div style={cardStyle} onClick={() => navigate("/create-mock")}>
          <h3>Create Mock test</h3>
        </div>
        <div style={cardStyle} onClick={() => navigate("/mocktest/upcoming")}>
          <h3>TPC Organized Upcoming Mock Tests</h3>
          <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>{upcoming.length} upcoming</p>
        </div>

        <div style={cardStyle} onClick={() => navigate("/mock-list")}>
          <h3>Previous TPC Mocks</h3>
          <p style={{ marginTop: "10px", color: "#666" }}>View all previous mocks</p>
        </div>

        <div style={cardStyle} onClick={() => navigate("/practice-test")}>
          <h3>Practice Mocks</h3>
        </div>

      </div>
    </div>
  );
}

const cardStyle = {
  background: "#f5f7fa",
  padding: "30px",
  borderRadius: "15px",
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};