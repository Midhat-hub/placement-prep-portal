import { useNavigate } from "react-router-dom";

export default function MockTestHome() {
  const navigate = useNavigate();

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
          <h3>TPC Organized Upcoming Mocks</h3>
        </div>

        <div style={cardStyle} onClick={() => navigate("/mock-list")}>
          <h3>Previous TPC Mocks</h3>
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