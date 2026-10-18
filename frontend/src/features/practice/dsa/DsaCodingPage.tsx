import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArrowRight, Code2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../../../services/firebase/client";
import { PageHeader } from "../../../components/PageHeader";

type Problem = { id: string; title?: string; category?: string; difficulty?: string };

export default function DsaCodingPage() {
  const [items, setItems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDocs(collection(db, "coding_questions"))
      .then((snapshot) => setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Problem))))
      .catch(() => setError("Unable to load coding questions. Check your Firebase connection."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const term = search.toLowerCase();
    return (!term || item.title?.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term))
      && (difficulty === "All" || item.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }), [items, search, difficulty]);

  return <><PageHeader eyebrow="LEARN & PRACTICE" title="DSA coding challenges" description="Solve real problems, submit against the existing judge, and build your solved streak." /><div className="table-panel feature-table"><div className="feature-filter"><div className="search-field"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search problems or patterns…" /></div><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select><span className="chip blue">{filtered.length} problems</span></div>{loading && <div className="empty-state"><p className="muted">Loading coding questions…</p></div>}{error && <div className="alert error">{error}</div>}{!loading && !error && filtered.map((problem) => <Link className="table-row" to={`/practice/dsa-coding/${problem.id}`} key={problem.id}><span><strong><Code2 size={14} /> {problem.title || "Untitled problem"}</strong><small>{problem.category || "General algorithms"}</small></span><span><b className={`difficulty ${(problem.difficulty || "").toLowerCase()}`}>{problem.difficulty || "Standard"}</b></span><ArrowRight size={16} /></Link>)}</div></>;
}
