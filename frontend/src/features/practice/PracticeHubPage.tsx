import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArrowRight, BookOpen, Code2, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { db } from "../../services/firebase/client";

export default function PracticeHubPage() {
  const [counts, setCounts] = useState({ dsa: 0, aptitude: 0, core: 0 });
  useEffect(() => { Promise.all([getDocs(collection(db, "coding_questions")), getDocs(collection(db, "questions", "aptitude", "items")), getDocs(collection(db, "questions", "core_subjects", "items"))]).then(([dsa, aptitude, core]) => setCounts({ dsa: dsa.size, aptitude: aptitude.size, core: core.size })); }, []);
  const cards = [{ title: "DSA & coding", description: "Data structures, algorithms, and real judge submissions.", icon: Code2, path: "/practice/dsa-coding", count: counts.dsa, color: "blue" }, { title: "Aptitude", description: "Quantitative and logical reasoning practice from Firestore.", icon: Target, path: "/practice/questions/aptitude", count: counts.aptitude, color: "orange" }, { title: "Core subjects", description: "OS, DBMS, OOP, and computer networks question sets.", icon: BookOpen, path: "/practice/questions/core_subjects", count: counts.core, color: "violet" }];
  return <><PageHeader eyebrow="LEARN & PRACTICE" title="Practice with purpose." description="Choose a live question collection and build measurable progress." /><div className="practice-grid">{cards.map((card) => <Link className="module-card" to={card.path} key={card.title}><div className={`feature-icon ${card.color}`}><card.icon size={22} /></div><h3>{card.title}</h3><p>{card.description}</p><div className="module-meta"><span>{card.count} questions available</span><ArrowRight size={15} /></div></Link>)}</div><div className="practice-hero" style={{ marginTop: 28 }}><div><span className="chip blue">COMPANY PREPARATION</span><h2>Target your next shortlist.</h2><p>Use the company track stored in Firestore for focused practice.</p><Link className="button light" to="/practice/company">Explore companies <ArrowRight size={16} /></Link></div></div></>;
}
