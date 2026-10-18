import { useParams, useNavigate } from "react-router-dom";
import {
  HashIcon,
  BrainIcon,
  FileTextIcon,
  CpuIcon,
  GlobeIcon,
  BarChartIcon,
  CodeIcon
} from "@/components/Icons";

function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const data = {
    aptitude: [
      {
        name: "Quantitative Aptitude",
        desc: "Arithmetic, algebra, percentages, ratios, time & work",
        route: "aptitude",
        type: "arithmetic",
        icon: <HashIcon size={24} color="var(--color-navy)" />,
      },
      {
        name: "Logical Reasoning",
        desc: "Puzzles, series, syllogisms, blood relations & seating arrangement",
        route: "aptitude",
        type: "logical",
        icon: <BrainIcon size={24} color="var(--color-navy)" />,
      },
      {
        name: "Verbal Ability",
        desc: "Grammar, reading comprehension, vocabulary & error spotting",
        route: "aptitude",
        type: "verbal",
        icon: <FileTextIcon size={24} color="var(--color-navy)" />,
      },
    ],

    core: [
      {
        name: "Operating Systems",
        desc: "Processes, threads, CPU scheduling, deadlocks, and memory management",
        route: "core_subjects",
        type: "OS",
        icon: <CpuIcon size={24} color="var(--color-navy)" />,
      },
      {
        name: "DBMS",
        desc: "SQL queries, relational algebra, normalization, transactions, ACID",
        route: "core_subjects",
        type: "DBMS",
        icon: <CpuIcon size={24} color="var(--color-navy)" />,
      },
      {
        name: "Object-Oriented Programming",
        desc: "Classes, inheritance, polymorphism, encapsulation, design patterns",
        route: "core_subjects",
        type: "OOP",
        icon: <CpuIcon size={24} color="var(--color-navy)" />,
      },
      {
        name: "Computer Networks",
        desc: "OSI & TCP/IP models, routing protocols, HTTP/HTTPS, DNS, sockets",
        route: "core_subjects",
        type: "CN",
        icon: <GlobeIcon size={24} color="var(--color-navy)" />,
      },
    ],

    dsa: [
      {
        name: "DSA MCQs",
        desc: "Concept questions on complexities, data structures, trees & graphs",
        route: "dsa",
        icon: <BarChartIcon size={24} color="var(--color-navy)" />,
      },
      {
        name: "DSA Coding Challenges",
        desc: "Hands-on coding problems with full multi-language online judge IDE",
        route: "dsa-coding",
        icon: <CodeIcon size={24} color="var(--color-navy)" />,
      },
    ],
  };

  const items = data[category] || [];

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
          Topic Modules
        </span>
        <h1 className="page-heading" style={{ margin: "4px 0 6px 0" }}>
          {category ? category.charAt(0).toUpperCase() + category.slice(1) : ""} Practice
        </h1>
        <p style={{ color: "var(--color-grey-muted)", fontSize: "14px", margin: 0 }}>
          Select a topic below to review question banks or launch practice exercises.
        </p>
      </div>

      <div className="category-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className="category-card"
            onClick={() => {
              if (category === "dsa" && item.name.includes("Coding")) {
                navigate("/practice/dsa-coding");
                return;
              }

              if (item.type) {
                navigate(`/practice/questions/${item.route}?type=${item.type}`);
              } else {
                navigate(`/practice/questions/${item.route}`);
              }
            }}
          >
            <div className="category-icon">{item.icon}</div>
            <div className="category-title">{item.name}</div>
            <p style={{ fontSize: "13px", color: "var(--color-grey-muted)", margin: "8px 0 16px 0", lineHeight: 1.5 }}>
              {item.desc}
            </p>
            <span className="badge badge-info" style={{ marginTop: "auto" }}>
              Start Practice →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
