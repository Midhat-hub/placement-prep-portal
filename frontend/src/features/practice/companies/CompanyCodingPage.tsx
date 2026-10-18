import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Check, ExternalLink, Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { auth, db } from "../../../services/firebase/client";

type Item = { id: string; problem?: string; platform?: string; link?: string; url?: string; completed?: boolean };
export default function CompanyCodingPage() {
  const { company = "deloitte" } = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => { Promise.all([getDocs(collection(db, "company_prep", company, "items")), auth.currentUser ? getDocs(collection(db, "user_progress", auth.currentUser.uid, "coding")) : Promise.resolve(null)]).then(([snapshot, progress]) => { const map = new Map<string, boolean>(); progress?.forEach((item) => map.set(item.id, Boolean(item.data().completed))); setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data(), completed: map.get(item.id) || false } as Item))); }); }, [company]);
  const filtered = useMemo(() => items.filter((item) => !search || `${item.problem} ${item.platform}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  async function toggle(item: Item) { if (!auth.currentUser) return; await setDoc(doc(db, "user_progress", auth.currentUser.uid, "coding", item.id), { completed: !item.completed, completedAt: new Date().toISOString() }, { merge: true }); setItems((current) => current.map((value) => value.id === item.id ? { ...value, completed: !item.completed } : value)); }
  return <><PageHeader eyebrow="CODING TRACK" title={`${company} coding practice`} description="The list below is loaded from the company_prep Firestore collection." /><div className="table-panel feature-table"><div className="feature-filter"><div className="search-field"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search problems…" /></div><span className="chip green">{items.filter((item) => item.completed).length} of {items.length} solved</span></div>{filtered.map((item) => <div className="table-row" key={item.id}><span><strong>{item.problem || "Coding problem"}</strong><small>{item.platform || "External practice platform"}</small></span><a className="text-link" href={item.link || item.url || "#"} target="_blank" rel="noreferrer">Practice <ExternalLink size={14} /></a><button className={item.completed ? "chip green" : "button"} onClick={() => void toggle(item)}>{item.completed && <Check size={13} />}{item.completed ? "Solved" : "Mark solved"}</button></div>)}</div></>;
}
