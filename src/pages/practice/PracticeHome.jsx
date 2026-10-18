import { useNavigate } from "react-router-dom";
import { BuildingIcon, HashIcon, CpuIcon, ZapIcon } from "@/components/Icons";

function PracticeHome() {
  const navigate = useNavigate();

  const sections = [
    {
      name: "Company Specific Preparation",
      desc: "Targeted aptitude and coding questions filtered by recruiting companies like Deloitte",
      route: "/practice/company",
      icon: <BuildingIcon size={24} color="var(--color-navy)" />,
      badge: "Targeted",
      badgeClass: "badge-info",
    },
    {
      name: "General Aptitude",
      desc: "Quantitative arithmetic, logical reasoning, and verbal aptitude preparation modules",
      route: "/practice/aptitude",
      icon: <HashIcon size={24} color="var(--color-navy)" />,
      badge: "Foundation",
      badgeClass: "badge-success",
    },
    {
      name: "Core Subjects",
      desc: "Operating Systems, Database Management (DBMS), Object Oriented Programming, and Networks",
      route: "/practice/core",
      icon: <CpuIcon size={24} color="var(--color-navy)" />,
      badge: "Theory & MCQs",
      badgeClass: "badge-neutral",
    },
    {
      name: "DSA Practice Hub",
      desc: "Topic-wise Data Structures, Algorithms MCQs, and full coding IDE challenges",
      route: "/practice/dsa",
      icon: <ZapIcon size={24} color="var(--color-navy)" />,
      badge: "Coding & MCQs",
      badgeClass: "badge-warning",
    },
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: "28px" }}>
        <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em" }}>
          Learning Curriculum
        </span>
        <h1 className="page-heading" style={{ margin: "4px 0 8px 0" }}>
          Practice Hub
        </h1>
        <p style={{ color: "var(--color-grey-muted)", fontSize: "14px", margin: 0 }}>
          Select a domain to begin topic-wise problem solving and placement readiness prep.
        </p>
      </div>

      <div className="practice-grid">
        {sections.map((item, i) => (
          <div
            key={i}
            className="practice-card"
            onClick={() => navigate(item.route)}
          >
            <div className="practice-icon">{item.icon}</div>
            <div className="practice-title">{item.name}</div>
            <p style={{ fontSize: "13px", color: "var(--color-grey-muted)", margin: "8px 0 16px 0", lineHeight: 1.5 }}>
              {item.desc}
            </p>
            <span className={`badge ${item.badgeClass}`} style={{ marginTop: "auto" }}>
              {item.badge} →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PracticeHome;