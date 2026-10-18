import { useNavigate } from "react-router-dom";
import { BuildingIcon } from "@/components/Icons";

function CompanyList() {
  const navigate = useNavigate();

  const companies = [
    {
      id: "deloitte",
      name: "Deloitte",
      desc: "Deloitte NLA pattern aptitude questions, verbal ability, and coding tracks",
      icon: <BuildingIcon size={24} color="var(--color-navy)" />,
      badge: "Active Drive",
    },
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: "24px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/practice")}
          style={{ fontSize: "12px", padding: "6px 14px", marginBottom: "12px" }}
        >
          ← Back to Practice Hub
        </button>

        <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em", display: "block" }}>
          Targeted Placement Series
        </span>
        <h1 className="page-heading" style={{ margin: "4px 0 6px 0" }}>
          Company-Specific Preparation
        </h1>
        <p style={{ color: "var(--color-grey-muted)", fontSize: "14px", margin: 0 }}>
          Practice verified previous year questions tailored to recruiting organizations.
        </p>
      </div>

      <div className="company-grid">
        {companies.map((company) => (
          <div
            key={company.id}
            className="company-card"
            onClick={() => navigate(`/practice/company/${company.id}`)}
          >
            <div className="company-icon">{company.icon}</div>
            <div className="company-name">{company.name}</div>
            <p style={{ fontSize: "13px", color: "var(--color-grey-muted)", margin: "8px 0 16px 0", lineHeight: 1.5 }}>
              {company.desc}
            </p>
            <span className="badge badge-info" style={{ marginTop: "auto" }}>
              Explore Material →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanyList;