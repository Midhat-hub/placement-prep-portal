import { useNavigate } from "react-router-dom";

function AdminDashboard() {

  const navigate = useNavigate();

  const cards = [
    {
      title: "Create Mock Test",
      icon: "📝",
      route: "/create-mock"
    },
    {
      title: "Upcoming Tests",
      icon: "📅",
      route: "/mocktest/upcoming"
    },
    {
      title: "Previous Tests",
      icon: "📚",
      route: "/previous-mocks"
    },
    {
      title: "Question Bank",
      icon: "❓",
      route: "/question-bank"
    }
  ];

  return (
    <div style={{ padding: "20px" }}>

      <h1
        style={{
          marginBottom: "30px",
          color: "#003b63"
        }}
      >
        Admin Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: "30px"
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.route)}
            style={{
              background: "#fff",
              borderRadius: "16px",
              height: "180px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)"
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "12px"
              }}
            >
              {card.icon}
            </div>

            <h3>{card.title}</h3>
          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminDashboard;