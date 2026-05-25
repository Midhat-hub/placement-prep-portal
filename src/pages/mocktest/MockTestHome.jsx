import { useNavigate } from "react-router-dom";

export default function MockTestHome() {

  const navigate = useNavigate();

  return (

    <div
      style={{
        padding: "20px"
      }}
    >

      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px"
        }}
      >
        Mock Test Hub
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "30px"
        }}
      >

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/mocktest/live")
          }
        >
          <div style={iconStyle}>🔴</div>
          <h3>Live Mocks</h3>
          <p>Attempt ongoing mock tests</p>
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/mocktest/upcoming")
          }
        >
          <div style={iconStyle}>📅</div>
          <h3>Upcoming Mocks</h3>
          <p>View scheduled tests</p>
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/mocktest/previous")
          }
        >
          <div style={iconStyle}>📚</div>
          <h3>Previous Mocks</h3>
          <p>View completed tests</p>
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/practice-test")
          }
        >
          <div style={iconStyle}>⚡</div>
          <h3>Practice Mocks</h3>
          <p>Practice anytime</p>
        </div>

      </div>

    </div>

  );

}

const cardStyle = {
  background: "#f5f7fa",
  padding: "35px",
  borderRadius: "18px",
  textAlign: "center",
  cursor: "pointer",
  boxShadow:
    "0 4px 12px rgba(0,0,0,0.08)",
  transition: "0.2s"
};

const iconStyle = {
  fontSize: "40px",
  marginBottom: "15px"
};