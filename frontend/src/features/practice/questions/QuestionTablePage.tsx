import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArrowRight, Search } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { db } from "../../../services/firebase/client";

type Question = { id: string; question?: string; topic?: string; subject?: string; difficulty?: string };

export default function QuestionTablePage() {
  const params = useParams();
  const collectionName = params.collectionName || "company_aptitude";
  const company = params.company;
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [items, setItems] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const source = collectionName === "company_aptitude"
      ? collection(db, "company_prep", "company_aptitude", "items")
      : collection(db, "questions", collectionName, "items");
    getDocs(source)
      .then((snapshot) => setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Question))))
      .finally(() => setLoading(false));
  }, [collectionName]);
  const filtered = useMemo(() => items.filter((item) => (!company || (item as Question & { company?: string }).company?.toLowerCase() === company.toLowerCase()) && (!type || item.topic === type || item.subject === type) && (!search || `${item.question} ${item.topic} ${item.difficulty}`.toLowerCase().includes(search.toLowerCase()))), [items, search, type, company]);
  return <><PageHeader eyebrow="QUESTION REPOSITORY" title={`${collectionName.replaceAll("_", " ")} questions`} description="Search the existing Firestore question collection and continue an attempt." /><div className="table-panel feature-table"><div className="feature-filter"><div className="search-field"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by question, topic, or difficulty…" /></div><span className="chip blue">{filtered.length} questions</span></div>{loading ? <div className="empty-state"><p className="muted">Loading questions…</p></div> : filtered.length ? filtered.map((item, index) => <Link className="table-row" to={`/practice/question/${collectionName}/${item.id}`} key={item.id}><span><strong>{index + 1}. {item.question || "Untitled question"}</strong><small>{item.topic || item.subject || "General practice"}</small></span><b className={`difficulty ${(item.difficulty || "").toLowerCase()}`}>{item.difficulty || "Standard"}</b><ArrowRight size={16} /></Link>) : <div className="empty-state"><p className="muted">No questions matched your filter.</p></div>}</div></>;
}
