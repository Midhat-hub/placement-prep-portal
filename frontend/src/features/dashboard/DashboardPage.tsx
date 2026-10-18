import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { Check, Code2, FileText, Target, Trophy, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, PolarAngleAxis,
  PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";
import { PageHeader } from "../../components/PageHeader";
import { auth, db } from "../../services/firebase/client";

type DashboardData = {
  attempts: number;
  coding: number;
  correct: number;
  wrong: number;
  resume: number;
  ats: number;
  upcoming: number;
  bestMock: number;
  modules: { name: string; value: number }[];
};

const emptyData: DashboardData = {
  attempts: 0, coding: 0, correct: 0, wrong: 0, resume: 0, ats: 0, upcoming: 0, bestMock: 0,
  modules: [
    { name: "DSA", value: 0 }, { name: "Aptitude", value: 0 },
    { name: "Core", value: 0 }, { name: "Coding", value: 0 },
  ],
};
const pieColors = ["var(--blue)", "var(--chart-muted)"];

function millis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function") return value.toMillis();
  if (value && typeof value === "object" && "seconds" in value) return Number(value.seconds) * 1000;
  return Date.parse(String(value || "")) || 0;
}

export default function DashboardPage() {
  const [data, setData] = useState(emptyData);
  const [firstName, setFirstName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const [attempts, coding, resume, mocks, upcoming, profile] = await Promise.all([
          getDocs(collection(db, "user_progress", user.uid, "attempts")),
          getDocs(collection(db, "user_progress", user.uid, "coding")),
          getDoc(doc(db, "user_progress", user.uid, "resume", "latest")),
          getDocs(collection(db, "user_progress", user.uid, "mock_tests")),
          getDocs(query(collection(db, "mockTests"), where("status", "==", "upcoming"))),
          getDoc(doc(db, "user_progress", user.uid, "profile", "details")),
        ]);
        const profileName = profile.data()?.name;
        if (typeof profileName === "string" && profileName.trim()) setFirstName(profileName.trim().split(/\s+/)[0]);
        let correct = 0;
        const moduleCounts = { DSA: 0, Aptitude: 0, Core: 0, Coding: coding.size };
        attempts.forEach((item) => {
          const value = item.data();
          if (value.correct) correct += 1;
          const key = String(item.id).toLowerCase();
          if (key.includes("apt")) moduleCounts.Aptitude += 1;
          else if (key.includes("core")) moduleCounts.Core += 1;
          else moduleCounts.DSA += 1;
        });
        const resumeData = resume.data() || {};
        const bestMock = mocks.docs.reduce((best, item) => {
          const value = item.data();
          return Math.max(best, Number(value.percentage ?? value.score ?? 0));
        }, 0);
        const next = {
          attempts: attempts.size, coding: coding.size, correct, wrong: attempts.size - correct,
          resume: Number(resumeData.overall_score || 0), ats: Number(resumeData.ats_score || 0),
          upcoming: upcoming.size, bestMock,
          modules: Object.entries(moduleCounts).map(([name, value]) => ({ name, value })),
        };
        if (!cancelled) setData(next);
      } catch {
        if (!cancelled) setError("Unable to load your live progress data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const accuracy = data.attempts ? Math.round((data.correct / data.attempts) * 100) : 0;
  const composite = [accuracy, data.resume, data.bestMock].filter((value) => value > 0);
  const readiness = composite.length ? Math.round(composite.reduce((sum, value) => sum + value, 0) / composite.length) : 0;
  const radarData = useMemo(() => data.modules.map((item) => ({
    subject: item.name,
    value: data.modules.reduce((max, current) => Math.max(max, current.value), 1) ? Math.round((item.value / Math.max(...data.modules.map((module) => module.value), 1)) * 100) : 0,
  })), [data.modules]);
  const pieData = [{ name: "Correct", value: data.correct }, { name: "Wrong", value: data.wrong }];

  return <div className="dashboard-page"><PageHeader eyebrow="YOUR WORKSPACE" title={`Good morning, ${firstName}.`} description="A live snapshot of your preparation progress." action={<Link className="button primary" to="/practice">Start practicing</Link>} />{error && <div className="alert error">{error}</div>}<section className="stat-grid"><Stat icon={TrendingUp} label="Readiness score" value={loading ? "…" : `${readiness}%`} note="Accuracy, resume, and mocks" /><Stat icon={Check} label="Practice accuracy" value={loading ? "…" : `${accuracy}%`} note={`${data.correct} correct of ${data.attempts}`} /><Stat icon={Code2} label="Problems solved" value={loading ? "…" : String(data.coding)} note="From coding progress" /><Stat icon={Trophy} label="Best mock score" value={loading ? "…" : `${data.bestMock}%`} note={`${data.upcoming} upcoming mocks`} /></section><div className="chart-grid"><ChartPanel title="Questions attempted by module" subtitle="Counts from your Firebase attempts and coding progress"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.modules} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted)" }} /><YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--muted)" }} /><Tooltip /><Bar dataKey="value" name="Completed" fill="var(--blue)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></ChartPanel><ChartPanel title="Skill radar" subtitle="Relative activity across your preparation modules"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid stroke="var(--chart-grid)" /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--muted)" }} /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} /><Radar name="Activity" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} /></RadarChart></ResponsiveContainer></ChartPanel><ChartPanel title="Answer accuracy" subtitle="Correct versus incorrect recorded attempts"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="42%" innerRadius={40} outerRadius={58} paddingAngle={3}>{pieData.map((item, index) => <Cell key={item.name} fill={pieColors[index]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} /></PieChart></ResponsiveContainer></ChartPanel><ChartPanel title="Resume health" subtitle="Latest persisted resume analysis"><div className="resume-chart"><div className="resume-score"><strong>{data.resume || "—"}</strong><span>overall</span></div><div className="resume-metric"><div><span>ATS compatibility</span><strong>{data.ats || "—"}%</strong></div><div className="progress-track"><i className="progress-fill blue" style={{ width: `${Math.min(data.ats, 100)}%` }} /></div></div><Link className="text-link" to="/resume">Open resume analyzer</Link></div></ChartPanel></div><div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h3>Keep your momentum</h3><p className="muted">Choose a next action based on live progress.</p></div><Target size={20} color="var(--blue)" /></div><div className="continue-grid compact"><Link className="continue-card" to="/practice/questions/aptitude"><div className="feature-icon orange"><Target size={19} /></div><div><h3>Practice questions</h3><p>Continue aptitude and core preparation.</p></div></Link><Link className="continue-card" to="/resume"><div className="feature-icon blue"><FileText size={19} /></div><div><h3>Improve your resume</h3><p>Review your latest ATS analysis.</p></div></Link></div></section><section className="panel"><div className="panel-heading"><div><h3>Progress signals</h3><p className="muted">Live values from your Firebase records.</p></div><Check size={19} color="var(--green)" /></div><div className="progress-row"><div><span>Attempts completed</span><strong>{data.attempts}</strong></div><div className="progress-track"><i className="progress-fill blue" style={{ width: `${Math.min(data.attempts, 100)}%` }} /></div></div><div className="progress-row"><div><span>Upcoming assessments</span><strong>{data.upcoming}</strong></div><div className="progress-track"><i className="progress-fill orange" style={{ width: `${Math.min(data.upcoming * 10, 100)}%` }} /></div></div></section></div></div>;
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="panel chart-panel"><div className="panel-heading"><div><h3>{title}</h3><p className="muted">{subtitle}</p></div></div><div className="chart-box">{children}</div></section>;
}

function Stat({ icon: Icon, label, value, note }: { icon: typeof TrendingUp; label: string; value: string; note: string }) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}
