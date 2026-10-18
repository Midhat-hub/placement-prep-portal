import { useMemo, useState } from "react";
import { Brain, Code2, Globe2, MonitorCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import core from "../../../../datasets/core_questions.json";
import dsa from "../../../../datasets/dsa_questions.json";
import aptitude from "../../../../datasets/general_aptitude.json";
import { PageHeader } from "../../components/PageHeader";

type Question = { question?: string; answer?: string; options?: string[]; subject?: string; category?: string; difficulty?: string; explanation?: string };
const domains = [
  { id: "all", label: "Full syllabus", description: "Core, DSA, and aptitude", icon: Globe2 },
  { id: "core", label: "Core subjects", description: "OS, DBMS, CN, and OOP", icon: MonitorCog },
  { id: "dsa", label: "DSA", description: "Algorithms and problem solving", icon: Code2 },
  { id: "aptitude", label: "Aptitude", description: "Quantitative and reasoning", icon: Brain },
];

export default function PracticeMockConfigurePage() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("all");
  const [count, setCount] = useState(10);
  const questions = useMemo(() => {
    const all = [
      ...core.map((item) => ({ ...item, category: "core" })),
      ...dsa.map((item) => ({ ...item, category: "dsa" })),
      ...aptitude.map((item) => ({ ...item, category: "aptitude" })),
    ] as Question[];
    return all.filter((item) => domain === "all" || item.category === domain);
  }, [domain]);
  function start() {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(count, questions.length));
    sessionStorage.setItem("practiceMock", JSON.stringify({ title: `Practice test — ${domain.toUpperCase()}`, questions: shuffled, duration: count }));
    navigate("/practice-test-page");
  }
  return <><PageHeader eyebrow="SELF-PACED PRACTICE" title="Configure practice mock" description="Generate a randomized timed assessment from the verified question datasets already used by the legacy frontend." /><section className="panel form-panel"><label className="field-label">Subject domain</label><div className="mode-tabs">{domains.map((item) => <button type="button" className={domain === item.id ? "selected" : ""} onClick={() => setDomain(item.id)} key={item.id}><item.icon size={18} /><strong>{item.label}</strong><span>{item.description}</span></button>)}</div><label className="field-label">Question count<select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[5, 10, 15, 20, 25].map((value) => <option value={value} key={value}>{value} questions · {value} minutes</option>)}</select></label><p className="muted">{questions.length} questions are available for this domain.</p><button className="button primary full" disabled={!questions.length} onClick={start}>Start practice session</button></section></>;
}
