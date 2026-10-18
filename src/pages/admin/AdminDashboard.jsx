import { useNavigate } from "react-router-dom";
import {
  SettingsIcon,
  FileTextIcon,
  CalendarIcon,
  FolderIcon,
  HelpCircleIcon
} from "@/components/Icons";

function AdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Create Mock Test",
      desc: "Configure questions, schedule dates, and publish new mock tests",
      icon: <FileTextIcon size={24} color="var(--color-navy)" />,
      route: "/create-mock",
      tag: "Action",
    },
    {
      title: "Upcoming Mocks",
      desc: "View and manage scheduled tests before they go live",
      icon: <CalendarIcon size={24} color="var(--color-navy)" />,
      route: "/admin/upcoming-mocks",
      tag: "Scheduled",
    },
    {
      title: "Previous Mocks",
      desc: "Inspect completed mock tests and review questions",
      icon: <FolderIcon size={24} color="var(--color-navy)" />,
      route: "/admin/previous-mocks",
      tag: "Archive",
    },
    {
      title: "Question Bank",
      desc: "Search and explore questions across DSA, Core, and Aptitude",
      icon: <HelpCircleIcon size={24} color="var(--color-navy)" />,
      route: "/question-bank",
      tag: "Repository",
    },
  ];

  return (
    <div className="admin-page">
      {/* Admin Hero Header */}
      <div className="admin-hero">
        <div className="admin-hero-icon">
          <SettingsIcon size={28} color="var(--color-white)" />
        </div>
        <div>
          <h1>Placement Office Administration</h1>
          <p>Manage question repositories, configure mock assessments, and monitor evaluation sessions.</p>
        </div>
        <span className="admin-badge">Admin Workspace</span>
      </div>

      {/* Admin Grid */}
      <div className="admin-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className="admin-card"
            onClick={() => navigate(card.route)}
          >
            <div className="admin-card-icon">{card.icon}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <h3>{card.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--color-grey-muted)", margin: 0 }}>
                {card.desc}
              </p>
            </div>
            <span
              className="badge badge-info"
              style={{ marginTop: "auto" }}
            >
              {card.tag} →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;