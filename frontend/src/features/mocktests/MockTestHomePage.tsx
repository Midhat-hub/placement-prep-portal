import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArrowRight, CalendarClock, FolderOpen, Radio, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { db } from "../../services/firebase/client";

export default function MockTestHomePage() {
  const [counts, setCounts] = useState({ live: 0, upcoming: 0, previous: 0 });
  useEffect(() => { getDocs(collection(db, "mockTests")).then((snapshot) => { const now = new Date(); let live = 0; let upcoming = 0; let previous = 0; snapshot.forEach((item) => { const data = item.data(); const start = data.startTime?.toDate?.(); const end = data.endTime?.toDate?.(); if (start && end && now >= start && now <= end) live += 1; else if (start && now < start) upcoming += 1; else if (end && now > end) previous += 1; }); setCounts({ live, upcoming, previous }); }); }, []);
  const cards = [{ title: "Live mocks", description: "Attempt tests that are running right now.", path: "/mocktest/live", icon: Radio, count: counts.live, color: "orange" }, { title: "Upcoming mocks", description: "Browse scheduled assessments and prepare.", path: "/mocktest/upcoming", icon: CalendarClock, count: counts.upcoming, color: "blue" }, { title: "Previous mocks", description: "Review completed tests and your saved scores.", path: "/mocktest/previous", icon: FolderOpen, count: counts.previous, color: "violet" }, { title: "Practice tests", description: "Build an assessment from available question sets.", path: "/practice-test", icon: Zap, count: null, color: "green" }];
  return <><PageHeader eyebrow="ASSESSMENTS" title="Mock test hub" description="Access live, upcoming, and previous tests from the existing Firestore schedule." /><div className="practice-grid">{cards.map((card) => <Link className="module-card" to={card.path} key={card.title}><div className={`feature-icon ${card.color}`}><card.icon size={22} /></div><h3>{card.title}</h3><p>{card.description}</p><div className="module-meta"><span>{card.count === null ? "Open workspace" : `${card.count} available`}</span><ArrowRight size={15} /></div></Link>)}</div></>;
}
