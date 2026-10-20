import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs } from "firebase/firestore";
import { ArrowRight, CalendarClock, Clock3, Radio, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { auth, db } from "../../services/firebase/client";

type Mock = { id: string; title?: string; duration?: number; questionCount?: number; questions?: unknown[]; startTime?: { toDate?: () => Date }; endTime?: { toDate?: () => Date }; attempt?: { score?: number; percentage?: number } };
function dateValue(value: Mock["startTime"]) { return value?.toDate ? value.toDate() : undefined; }
export default function MockListPage({ kind, admin = false }: { kind: "live" | "upcoming" | "previous"; admin?: boolean }) {
  const [items, setItems] = useState<Mock[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(collection(db, "mockTests"));
      const now = new Date();
      const values = await Promise.all(snapshot.docs.map(async (item) => {
        const data = item.data() as Mock;
        const start = dateValue(data.startTime); const end = dateValue(data.endTime);
        const matches = kind === "live" ? Boolean(start && end && now >= start && now <= end) : kind === "upcoming" ? Boolean(start && now < start) : Boolean(end && now > end);
        if (!matches) return null;
        let attempt: Mock["attempt"];
        if (!admin && kind === "previous" && auth.currentUser) { const attemptDoc = await getDoc(doc(db, "user_progress", auth.currentUser.uid, "mock_tests", item.id)); if (attemptDoc.exists()) attempt = attemptDoc.data() as Mock["attempt"]; }
        return { ...data, id: item.id, attempt };
      }));
      setItems(values.filter((item) => item !== null) as Mock[]);
      setLoading(false);
    }
    void load();
    const timer = window.setInterval(() => void load(), kind === "live" ? 30000 : 60000);
    return () => window.clearInterval(timer);
  }, [kind]);
  const title = kind === "live" ? "Live mock tests" : kind === "upcoming" ? "Upcoming mock tests" : "Previous mock tests";
  async function removeMock(id: string) {
    if (!window.confirm("Delete this mock assessment?")) return;
    await deleteDoc(doc(db, "mockTests", id));
    setItems((current) => current.filter((item) => item.id !== id));
  }
  return <><PageHeader eyebrow={admin ? "ADMINISTRATION" : "ASSESSMENTS"} title={admin ? `${title} assessments` : title} description={admin ? "Review and manage assessments in the mockTests Firestore collection." : "This view is filtered from the existing mockTests Firestore collection."} /><div className="mock-list">{loading ? <div className="empty-state"><p className="muted">Loading mocks…</p></div> : items.length ? items.map((item) => <div className="mock-list-card" key={item.id}><div className="feature-icon">{kind === "live" ? <Radio size={20} /> : kind === "upcoming" ? <CalendarClock size={20} /> : <Trophy size={20} />}</div><div className="mock-list-copy"><h3>{item.title || "Placement mock test"}</h3><p><span>{item.questionCount || item.questions?.length || 0} questions</span><span><Clock3 size={13} /> {item.duration || 30} min</span>{dateValue(item.startTime)?.toLocaleString()}</p></div><div className="mock-list-action">{admin ? <button className="button danger" onClick={() => void removeMock(item.id)}>Delete</button> : kind === "previous" ? <><span className="chip green">{item.attempt ? `${item.attempt.percentage ?? item.attempt.score ?? 0}%` : "Not attempted"}</span><button className="button" onClick={() => navigate(`/mock-review/${item.id}`)}>Review</button></> : kind === "live" ? <Link className="button primary" to={`/test/${item.id}`}>Start test <ArrowRight size={14} /></Link> : <span className="chip blue">Scheduled</span>}</div></div>) : <div className="empty-state"><div className="empty-icon"><CalendarClock size={24} /></div><h3>No {kind} mocks found</h3><p className="muted">There are no matching documents in the existing mockTests collection.</p></div>}</div></>;
}
