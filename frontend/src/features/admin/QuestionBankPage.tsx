import { useMemo, useState } from "react";
import { HelpCircle, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import coreQuestions from "../../../../datasets/core_questions.json";
import dsaQuestions from "../../../../datasets/dsa_questions.json";
import aptitudeQuestions from "../../../../datasets/general_aptitude.json";

type Question = { question?: string; difficulty?: string; topic?: string; category: string };
const categories = ["core", "dsa", "aptitude"];

export default function QuestionBankPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const questions = useMemo<Question[]>(() => [
    ...coreQuestions.map((item) => ({ ...item, category: "core" })),
    ...dsaQuestions.map((item) => ({ ...item, category: "dsa" })),
    ...aptitudeQuestions.map((item) => ({ ...item, category: "aptitude" })),
  ] as Question[], []);
  const filtered = questions.filter((item) => (!search || item.question?.toLowerCase().includes(search.toLowerCase())) && (category === "all" || item.category === category) && (difficulty === "all" || item.difficulty?.toLowerCase() === difficulty));
  return <><PageHeader eyebrow="ADMINISTRATION" title="Central question bank" description="Search and review the question inventory used across assessments." action={<span className="chip blue"><HelpCircle size={14} /> {filtered.length} questions</span>} /><div className="table-panel feature-table"><div className="feature-filter"><div className="search-field"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" /></div><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All domains</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="all">All difficulties</option><option>easy</option><option>medium</option><option>hard</option></select></div>{filtered.map((item, index) => <details className="qb-item" key={`${item.category}-${index}`}><summary><strong>#{index + 1} {item.question || "Untitled question"}</strong><span className={`difficulty ${(item.difficulty || "").toLowerCase()}`}>{item.difficulty || "Standard"}</span></summary><p className="muted">{item.topic || "General"} · {item.category}</p></details>)}</div></>;
}
