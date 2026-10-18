import { useParams, useNavigate } from "react-router-dom";
import { BrainIcon, CodeIcon } from "@/components/Icons";

function CompanyPage() {
  const { company } = useParams();
  const navigate = useNavigate();

  const formattedName = company ? company.charAt(0).toUpperCase() + company.slice(1) : "Company";

  return (
    <div className="page">
      <div style={{ marginBottom: "24px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/practice/company")}
          style={{ fontSize: "12px", padding: "6px 14px", marginBottom: "12px" }}
        >
          ← Back to Company List
        </button>

        <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.06em", display: "block" }}>
          Recruitment Track
        </span>
        <h1 className="page-heading" style={{ margin: "4px 0 6px 0" }}>
          {formattedName} Placement Preparation
        </h1>
        <p style={{ color: "var(--color-grey-muted)", fontSize: "14px", margin: 0 }}>
          Access targeted aptitude questions and platform coding challenges for {formattedName}.
        </p>
      </div>

      <div className="company-actions">
        <div
          className="company-action-card"
          onClick={() => navigate(`/practice/company/${company}/aptitude`)}
        >
          <div className="action-icon">
            <BrainIcon size={28} color="var(--color-navy)" />
          </div>
          <div className="action-title">Aptitude & Technical MCQs</div>
          <p style={{ fontSize: "13px", color: "var(--color-grey-muted)", margin: "8px 0 16px 0", lineHeight: 1.5 }}>
            Previous drive aptitude questions, quantitative patterns, and logical reasoning.
          </p>
          <span className="badge badge-info" style={{ marginTop: "auto" }}>
            Open Aptitude Practice →
          </span>
        </div>

        <div
          className="company-action-card"
          onClick={() => navigate(`/practice/coding/${company}`)}
        >
          <div className="action-icon">
            <CodeIcon size={28} color="var(--color-navy)" />
          </div>
          <div className="action-title">Coding Practice Problems</div>
          <p style={{ fontSize: "13px", color: "var(--color-grey-muted)", margin: "8px 0 16px 0", lineHeight: 1.5 }}>
            Frequently asked coding questions with links to practice on LeetCode / HackerRank.
          </p>
          <span className="badge badge-success" style={{ marginTop: "auto" }}>
            Open Coding Challenges →
          </span>
        </div>
      </div>
    </div>
  );
}

export default CompanyPage;