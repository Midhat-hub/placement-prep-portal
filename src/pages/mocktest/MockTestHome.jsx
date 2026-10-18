import { useNavigate } from "react-router-dom";
import { RadioIcon, CalendarIcon, FolderIcon, ZapIcon } from "@/components/Icons";

export default function MockTestHome() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <RadioIcon size={24} color="#ef4444" />,
      title: "Live Mocks",
      desc: "Attempt ongoing mock tests in real time",
      route: "/mocktest/live",
      badgeClass: "badge-error",
      badge: "Live Now",
    },
    {
      icon: <CalendarIcon size={24} color="var(--color-navy)" />,
      title: "Upcoming Mocks",
      desc: "Browse and prepare for scheduled tests",
      route: "/mocktest/upcoming",
      badgeClass: "badge-info",
      badge: "Scheduled",
    },
    {
      icon: <FolderIcon size={24} color="var(--color-navy)" />,
      title: "Previous Mocks",
      desc: "Review completed tests and your scores",
      route: "/mocktest/previous",
      badgeClass: "badge-neutral",
      badge: "Completed",
    },
    {
      icon: <ZapIcon size={24} color="var(--color-blue)" />,
      title: "Practice Mocks",
      desc: "Practice anytime with sample questions",
      route: "/practice-test",
      badgeClass: "badge-success",
      badge: "Practice",
    },
  ];

  return (
    <div className="mock-home-page">
      {/* Hero */}
      <div className="mock-home-hero">
        <h1>Mock Test Hub</h1>
        <p>Access live, upcoming, and previous mock tests — or practice anytime.</p>
      </div>

      {/* Cards */}
      <div className="mock-home-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className="mock-hub-card"
            onClick={() => navigate(card.route)}
          >
            <div className="mock-hub-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <span className={`badge ${card.badgeClass}`} style={{ marginTop: "12px" }}>
              {card.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}