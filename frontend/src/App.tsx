import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowRight, BarChart3, BookOpen, Bot, BriefcaseBusiness, CalendarClock, Check,
  ChevronRight, CircleHelp, Clock3, Code2, FileText, Flame, GraduationCap,
  LayoutDashboard, LogOut, Menu, Mic2, Moon, MoreHorizontal, Play, Plus,
  Search, Send, Settings, ShieldCheck, Sparkles, Target, TrendingUp, Trophy,
  UserRound, X, Zap, Sun,
} from "lucide-react";
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DsaCodingPage from "./features/practice/dsa/DsaCodingPage";
import CodingIdePage from "./features/practice/dsa/CodingIdePage";
import VoiceInterviewPage from "./features/interview/VoiceInterviewPage";
import QuestionTablePage from "./features/practice/questions/QuestionTablePage";
import MockTestPage from "./features/mocktests/TestPage";
import QuestionBankPage from "./features/admin/QuestionBankPage";
import AdminDashboardPage from "./features/admin/AdminDashboardPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import CompanyListPage from "./features/practice/companies/CompanyListPage";
import CompanyPage from "./features/practice/companies/CompanyPage";
import CompanyCodingPage from "./features/practice/companies/CompanyCodingPage";
import QuestionPage from "./features/practice/questions/QuestionPage";
import MockListPage from "./features/mocktests/MockListPage";
import PracticeHubPage from "./features/practice/PracticeHubPage";
import MockTestHomePage from "./features/mocktests/MockTestHomePage";
import CreateMockPage from "./features/admin/CreateMockPage";
import MockReviewPage from "./features/mocktests/MockReviewPage";
import PracticeMockConfigurePage from "./features/mocktests/PracticeMockConfigurePage";
import PracticeMockPage from "./features/mocktests/PracticeMockPage";
import ProfilePage from "./features/profile/ProfilePage";
import { auth, authPersistenceReady, db } from "./services/firebase/client";
import { api, apiError } from "./services/api/client";
import { analyzeResume } from "./services/api/resumeApi";
import { sendChatMessage } from "./services/api/chatbotApi";
import { startInterview } from "./services/api/interviewApi";

type Icon = typeof LayoutDashboard;
const nav = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Practice hub", icon: BookOpen, path: "/practice" },
  { label: "Mock tests", icon: ClipboardIcon, path: "/mocktest" },
  { label: "Resume analyzer", icon: FileText, path: "/resume" },
  { label: "AI Buddy", icon: Bot, path: "/chatbot" },
  { label: "Voice interview", icon: Mic2, path: "/voice-interview" },
];
const adminNav = [
  { label: "Admin overview", icon: ShieldCheck, path: "/admin/dashboard" },
  { label: "Question bank", icon: BookOpen, path: "/question-bank" },
  { label: "Create mock", icon: Plus, path: "/create-mock" },
  { label: "Upcoming mocks", icon: CalendarClock, path: "/admin/upcoming-mocks" },
  { label: "Previous mocks", icon: Trophy, path: "/admin/previous-mocks" },
];
const practiceItems = [
  { title: "DSA & coding", detail: "Data structures, algorithms and timed challenges", icon: Code2, path: "/practice/dsa-coding", color: "blue" },
  { title: "Company prep", detail: "Targeted practice for your next shortlist", icon: BriefcaseBusiness, path: "/practice/company", color: "violet" },
  { title: "Aptitude & core", detail: "Build confidence across placement essentials", icon: Target, path: "/practice/aptitude", color: "orange" },
];
function ClipboardIcon(props: React.ComponentProps<Icon>) { return <FileText {...props} />; }

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    let unsubscribe = () => {};
    void authPersistenceReady.then(() => {
      unsubscribe = onAuthStateChanged(auth, setUser);
    }).catch(() => setUser(null));
    return () => unsubscribe();
  }, []);
  return <Routes>
    <Route path="/" element={<AuthPage mode="login" />} />
    <Route path="/signup" element={<AuthPage mode="signup" />} />
    <Route path="/admin-login" element={<AuthPage mode="admin" />} />
    <Route element={<Protected user={user} />}>
      <Route element={<AppShell user={user!} />}>
        <Route path="/dashboard" element={user?.email === "admin@placementportal.com" ? <Navigate to="/admin/dashboard" replace /> : <DashboardPage />} />
        <Route path="/profile" element={user?.email === "admin@placementportal.com" ? <Navigate to="/admin/dashboard" replace /> : <ProfilePage />} />
        <Route path="/practice" element={<PracticeHubPage />} />
        <Route path="/practice/dsa-coding" element={<DsaCodingPage />} />
        <Route path="/practice/dsa-coding/:id" element={<CodingIdePage />} />
        <Route path="/practice/company" element={<CompanyListPage />} />
        <Route path="/practice/company/:company" element={<CompanyPage />} />
        <Route path="/practice/coding/:company" element={<CompanyCodingPage />} />
        <Route path="/practice/company/:company/aptitude" element={<QuestionTablePage />} />
        <Route path="/practice/questions/:collectionName" element={<QuestionTablePage />} />
        <Route path="/practice/question/:collectionName/:id" element={<QuestionPage />} />
        <Route path="/mocktest/live" element={<MockListPage kind="live" />} />
        <Route path="/mocktest/upcoming" element={<MockListPage kind="upcoming" />} />
        <Route path="/mocktest/previous" element={<MockListPage kind="previous" />} />
        <Route path="/mock-review/:mockId" element={<MockReviewPage />} />
        <Route path="/practice-test" element={<PracticeMockConfigurePage />} />
        <Route path="/practice-test-page" element={<PracticeMockPage />} />
        <Route path="/test/:mockId" element={<MockTestPage />} />
        <Route path="/question-bank" element={<AdminOnly user={user!}><QuestionBankPage /></AdminOnly>} />
        <Route path="/admin/dashboard" element={<AdminOnly user={user!}><AdminDashboardPage /></AdminOnly>} />
        <Route path="/admin/upcoming-mocks" element={<AdminOnly user={user!}><MockListPage kind="upcoming" admin /></AdminOnly>} />
        <Route path="/admin/previous-mocks" element={<AdminOnly user={user!}><MockListPage kind="previous" admin /></AdminOnly>} />
        <Route path="/create-mock" element={<AdminOnly user={user!}><CreateMockPage /></AdminOnly>} />
        <Route path="/practice/*" element={<Practice />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/voice-interview" element={<VoiceInterviewPage />} />
        <Route path="/mocktest" element={<MockTestHomePage />} />
        <Route path="*" element={<Dashboard user={user!} />} />
      </Route>
    </Route>
  </Routes>;
}

export default App;

function Protected({ user }: { user: User | null | undefined }) {
  if (user === undefined) return <div className="boot"><div className="brand-mark">P</div><span>Loading your workspace…</span></div>;
  return user ? <Outlet /> : <Navigate to="/" replace />;
}

function AdminOnly({ user, children }: { user: User; children: React.ReactNode }) {
  return user.email === "admin@placementportal.com" ? <>{children}</> : <div className="empty-state"><div className="empty-icon"><ShieldCheck size={24} /></div><h3>Administrator access required</h3><p className="muted">This account is not authorized for the admin portal.</p><Link className="button primary" to="/dashboard">Return to dashboard</Link></div>;
}

function AppShell({ user }: { user: User }) {
  const isAdmin = user.email === "admin@placementportal.com";
  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState(user.displayName || (isAdmin ? "Administrator" : "Student"));
  const [darkMode, setDarkMode] = useState(() => {
    const saved = window.localStorage.getItem("prepportal-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const location = useLocation();
  const active = nav.find((item) => location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path)));
  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    async function loadProfileName() {
      try {
        const snapshot = await getDoc(doc(db, "user_progress", user.uid, "profile", "details"));
        const savedName = snapshot.data()?.name;
        if (!cancelled && typeof savedName === "string" && savedName.trim()) setProfileName(savedName.trim());
      } catch {
        if (!cancelled) setProfileName(user.displayName || (isAdmin ? "Administrator" : "Student"));
      }
    }
    void loadProfileName();
    return () => { cancelled = true; };
  }, [isAdmin, location.pathname, user.displayName, user.uid]);
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    window.localStorage.setItem("prepportal-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  return <div className="app-frame">
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand"><div className="brand-mark">P</div><div><strong>PrepPortal</strong><small>Placement OS</small></div><button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
      <div className="workspace-label">{isAdmin ? "ADMINISTRATION" : "WORKSPACE"}</div>
      <nav>{(isAdmin ? adminNav : nav).map((item) => <Link key={item.path} to={item.path} onClick={() => setOpen(false)} className={active?.path === item.path ? "nav-item active" : "nav-item"}><item.icon size={18} /><span>{item.label}</span>{active?.path === item.path && <span className="active-dot" />}</Link>)}</nav>
      <div className="sidebar-bottom">{!isAdmin && <div className="upgrade-card"><Sparkles size={17} /><strong>Reach your next level</strong><p>Track your readiness and stay interview-ready.</p><Link to="/resume">View progress <ArrowRight size={13} /></Link></div>}<button className="profile-row" onClick={() => signOut(auth)}><span className="avatar">{(profileName || user.email || "S")[0].toUpperCase()}</span><span className="profile-copy"><strong>{profileName}</strong><small>{user.email}</small></span><LogOut size={16} /></button></div>
    </aside>
    {open && <button className="drawer-backdrop mobile-only" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <main className="main-shell">
      <header className="topbar"><button className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumbs"><span>{isAdmin ? "Administration" : "Workspace"}</span><ChevronRight size={14} /><strong>{active?.label || (isAdmin ? "Admin overview" : "Overview")}</strong></div><div className="topbar-actions"><button className="icon-button" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>{isAdmin ? <span className="topbar-user"><span className="avatar small">{(profileName || "A")[0].toUpperCase()}</span><span>{profileName}</span></span> : <Link className="topbar-user" to="/profile"><span className="avatar small">{(profileName || user.email || "S")[0].toUpperCase()}</span><span>{profileName}</span></Link>}</div></header>
      <div className="page-content"><Outlet /></div>
    </main>
  </div>;
}

function AuthPage({ mode }: { mode: "login" | "signup" | "admin" }) {
  const navigate = useNavigate(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const isAdmin = mode === "admin";
  async function submit(e: FormEvent) { e.preventDefault(); setError(""); setLoading(true); try { await authPersistenceReady; if (mode === "signup") await createUserWithEmailAndPassword(auth, email, password); else { const credential = await signInWithEmailAndPassword(auth, email, password); if (isAdmin && credential.user.email !== "admin@placementportal.com") { await signOut(auth); throw new Error("Access denied. This account does not have administrator privileges."); } } navigate(isAdmin ? "/admin/dashboard" : "/dashboard"); } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in. Please try again."); } finally { setLoading(false); } }
  return <div className="auth-page"><div className="auth-visual"><div className="auth-visual-content"><div className="brand-mark large">P</div><p className="eyebrow">THE PLACEMENT OS</p><h1>Build the career<br /><em>you’re ready for.</em></h1><p className="auth-intro">A focused workspace to practice deliberately, sharpen your story, and walk into every interview with confidence.</p><div className="auth-quote"><span>“</span><p>Preparation is not about doing more. It’s about knowing what to do next.</p></div><div className="auth-visual-footer"><span><ShieldCheck size={15} /> Secure Firebase authentication</span><span>© 2025 PrepPortal</span></div></div></div><div className="auth-form-panel"><div className="auth-form-wrap"><div className="auth-mobile-brand"><div className="brand-mark">P</div><strong>PrepPortal</strong></div><p className="eyebrow">{isAdmin ? "ADMIN PORTAL" : "WELCOME BACK"}</p><h2>{mode === "signup" ? "Create your workspace" : isAdmin ? "Sign in as an admin" : "Let’s get you ready."}</h2><p className="muted">{mode === "signup" ? "Start building your placement edge today." : "Enter your details to continue to PrepPortal."}</p>{error && <div className="alert error"><CircleHelp size={16} />{error}</div>}<form onSubmit={submit} className="auth-form"><label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required minLength={6} autoComplete="current-password" /></label><button className="button primary full" disabled={loading}>{loading ? "Authenticating…" : isAdmin ? "Access admin portal" : mode === "signup" ? "Create account" : "Continue to dashboard"}<ArrowRight size={17} /></button></form><p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to PrepPortal?"} <button onClick={() => navigate(mode === "signup" ? "/" : "/signup")}>{mode === "signup" ? "Sign in" : "Create account"}</button></p>{!isAdmin && <button className="admin-link" onClick={() => navigate("/admin-login")}><ShieldCheck size={14} /> Placement team? Enter admin portal</button>}</div></div></div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div>{action}</div>; }
function StatCard({ icon: Icon, label, value, note, trend }: { icon: Icon; label: string; value: string; note: string; trend?: string }) { return <div className="stat-card"><div className="stat-icon"><Icon size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{trend && <span className="trend">{trend}</span>}{note}</div></div>; }
function Dashboard({ user }: { user: User }) {
  const first = (user.displayName || user.email || "there").split(" ")[0]; const [activity, setActivity] = useState([42, 58, 35, 68, 50, 76, 62, 82, 70, 88, 74, 93]);
  return <><PageHeader eyebrow="MONDAY, OCTOBER 21" title={`Good morning, ${first}.`} description="Here’s your preparation snapshot for today." action={<Link className="button primary" to="/practice"><Play size={16} /> Start practicing</Link>} /><section className="stat-grid"><StatCard icon={TrendingUp} label="Readiness score" value="68%" note="Keep building momentum" trend="+6.4%" /><StatCard icon={Check} label="Practice accuracy" value="76%" note="Across 124 attempts" trend="+4.2%" /><StatCard icon={Code2} label="Problems solved" value="48" note="12 this week" trend="+8" /><StatCard icon={Trophy} label="Best mock score" value="82%" note="Mock test · Oct 18" /></section><div className="dashboard-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h3>Preparation activity</h3><p className="muted">Your practice consistency over the last 12 weeks</p></div><button className="select-button">Last 12 weeks <ChevronRight size={14} /></button></div><div className="chart"><div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-body"><div className="grid-lines">{[1,2,3,4,5].map(i => <i key={i} />)}</div><div className="bars">{activity.map((height, i) => <div className="bar-wrap" key={i}><div className="bar" style={{ height: `${height}%` }}><span>{height}</span></div><small>{["Jun 3","Jun 10","Jun 17","Jun 24","Jul 1","Jul 8","Jul 15","Jul 22","Jul 29","Aug 5","Aug 12","Aug 19"][i]}</small></div>)}</div></div></div><div className="panel-footer"><span><i className="legend-dot blue-dot" /> Practice activity</span><span className="footer-note"><Flame size={14} /> 5 day streak</span></div></section><section className="panel readiness-panel"><div className="panel-heading"><div><h3>Readiness breakdown</h3><p className="muted">Your strongest areas and next focus</p></div><MoreHorizontal size={19} className="muted" /></div><div className="readiness-score"><div className="ring"><strong>68</strong><span>/ 100</span></div><div><strong>Good progress</strong><p className="muted">You’re ahead of 64% of learners this week.</p></div></div>{[["DSA & coding",82,"blue"],["Aptitude",74,"green"],["Core subjects",56,"orange"],["Interview readiness",48,"violet"]].map(([label, value, color]) => <div className="progress-row" key={label as string}><div><span>{label}</span><strong>{value}%</strong></div><div className="progress-track"><i className={`progress-fill ${color}`} style={{ width: `${value}%` }} /></div></div>)}<Link className="text-link" to="/practice">View detailed insights <ArrowRight size={14} /></Link></section></div><section className="section-block"><div className="section-heading"><div><h2>Continue your preparation</h2><p className="muted">Pick up exactly where you left off.</p></div><Link className="text-link" to="/practice">View all <ArrowRight size={14} /></Link></div><div className="continue-grid">{practiceItems.map(item => <Link className="continue-card" to={item.path} key={item.title}><div className={`feature-icon ${item.color}`}><item.icon size={21} /></div><div><h3>{item.title}</h3><p>{item.detail}</p></div><ArrowRight size={17} className="card-arrow" /></Link>)}</div></section></>;
}

function Practice() { return <><PageHeader eyebrow="LEARN & PRACTICE" title="Practice with purpose." description="Build fluency across the skills that matter in your next placement round." /><div className="practice-hero"><div><span className="chip blue">YOUR FOCUS THIS WEEK</span><h2>Consistency compounds.</h2><p>Complete 3 more sessions to maintain your weekly momentum.</p><Link className="button light" to="/practice/dsa-coding">Explore practice <ArrowRight size={16} /></Link></div><div className="goal-ring"><strong>4<span>/7</span></strong><small>sessions</small></div></div><div className="section-heading"><div><h2>Practice modules</h2><p className="muted">Choose a track and make meaningful progress.</p></div></div><div className="practice-grid">{practiceItems.map(item => <Link to={item.path} className="module-card" key={item.title}><div className={`feature-icon ${item.color}`}><item.icon size={22} /></div><h3>{item.title}</h3><p>{item.detail}</p><div className="module-meta"><span>Explore module</span><ArrowRight size={15} /></div></Link>)}</div><div className="section-heading spaced"><div><h2>Recommended for you</h2><p className="muted">Based on your recent practice.</p></div></div><div className="table-panel"><div className="table-row table-head"><span>Question</span><span>Topic</span><span>Difficulty</span><span /></div>{["Longest substring without repeat","Two sum in a sorted array","Binary tree level order"].map((q, i) => <Link className="table-row" to="/practice/dsa-coding" key={q}><span><strong>{q}</strong><small>DSA · Problem {124+i}</small></span><span>{["Sliding window","Two pointers","Trees"][i]}</span><span><b className={`difficulty ${i === 1 ? "easy" : "medium"}`}>{i === 1 ? "Easy" : "Medium"}</b></span><ArrowRight size={16} /></Link>)}</div></>; }

function ResumeAnalyzer() { const [file, setFile] = useState<File | null>(null); const [job, setJob] = useState(""); const [loading, setLoading] = useState(false); const [result, setResult] = useState<Record<string, unknown> | null>(null); const [error, setError] = useState(""); const [showDetails, setShowDetails] = useState(false); async function analyze() { if (!file) return; if (file.size > 16 * 1024 * 1024) { setError("Resume files must be 16 MB or smaller."); return; } setLoading(true); setError(""); setShowDetails(false); try { setResult(await analyzeResume(file, job)); } catch (e) { setError(apiError(e, "Analysis failed. Please try again.")); } finally { setLoading(false); } } return <><PageHeader eyebrow="AI TOOLKIT" title="Resume analyzer" description="Turn your resume into a clearer, stronger story for the roles you want." /><div className="resume-grid"><section className="panel upload-panel"><div className="panel-heading"><div><h3>Analyze your resume</h3><p className="muted">PDF or DOCX · maximum 16 MB</p></div><Sparkles size={20} className="accent-icon" /></div><label className={`dropzone ${file ? "has-file" : ""}`}><input type="file" accept=".pdf,.docx" onChange={e => setFile(e.target.files?.[0] || null)} /><FileText size={28} /><strong>{file ? file.name : "Drop your resume here"}</strong><span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze` : "or click to browse from your device"}</span></label><label className="field-label">Optional job description<span className="muted">Paste a role description to get a targeted match score.</span><textarea value={job} onChange={e => setJob(e.target.value)} placeholder="Paste the job description here…" rows={6} /></label>{error && <div className="alert error"><CircleHelp size={16} />{error}</div>}<button className="button primary full" disabled={!file || loading} onClick={analyze}>{loading ? "Analyzing your resume…" : "Analyze resume"}<Sparkles size={16} /></button></section><section className="panel analysis-panel">{result ? <><div className="result-top"><div><p className="eyebrow">ANALYSIS COMPLETE</p><h3>{String(result.filename || file?.name)}</h3></div><span className="chip green"><Check size={13} /> Ready</span></div><div className="score-grid"><div><span>Overall score</span><strong>{String(result.overall_score ?? "—")}</strong><small>/ 100</small></div><div><span>ATS compatibility</span><strong>{String(result.ats_score ?? "—")}</strong><small>/ 100</small></div></div><div className="analysis-summary"><h4>What to do next</h4><p className="muted">Your full analysis is ready. Review the section feedback and use the recommendations to strengthen your application.</p><button className="text-link" onClick={() => setShowDetails((visible) => !visible)}>View detailed feedback {showDetails ? "↑" : <ArrowRight size={14} />}</button>{showDetails && <ResumeDetails result={result} />}</div></> : <div className="empty-state"><div className="empty-icon"><FileText size={24} /></div><h3>Your analysis will appear here</h3><p className="muted">Upload a resume to see your ATS score, strengths, and actionable feedback in one place.</p></div>}</section></div></>; }

function ResumeDetails({ result }: { result: Record<string, unknown> }) {
  const analysisJson = (result.analysis_json && typeof result.analysis_json === "object" ? result.analysis_json : {}) as Record<string, unknown>;
  const list = (value: unknown) => Array.isArray(value) ? value.map(String).filter(Boolean) : [];
  const sections = Array.isArray(analysisJson.detailed_analysis_sections) ? analysisJson.detailed_analysis_sections as Record<string, unknown>[] : [];
  const detailedText = String(analysisJson.detailed_analysis || result.analysis || "").trim();
  const groups = [
    ["Key Strengths", list(analysisJson.key_strengths)],
    ["Areas for Improvement", list(analysisJson.areas_for_improvement)],
    ["Skills Identified", list(analysisJson.skills_identified)],
    ["Suggestions for Enhancement", list(analysisJson.suggestions_for_enhancement)],
  ];
  return <div className="resume-details"><div className="resume-detail-grid">{groups.map(([title, items]) => <div className="resume-detail-box" key={String(title)}><h4>{String(title)}</h4>{(items as string[]).length ? <ul>{(items as string[]).map((item) => <li key={item}>{item.replace(/^[-•*]\s*/, "")}</li>)}</ul> : <p className="muted">No details were returned for this section.</p>}</div>)}</div><div className="resume-detail-box full"><h4>Detailed Analysis</h4>{sections.length ? sections.map((section, index) => <div className="analysis-section" key={`${String(section.title || "section")}-${index}`}><h5>{[section.emoji, section.title].filter(Boolean).join(" ")}</h5><p>{String(section.content || "")}</p></div>) : detailedText ? <div className="analysis-section plain-analysis"><p>{detailedText}</p></div> : <p className="muted">Detailed analysis is not available for this run.</p>}</div><div className="resume-metadata"><span><strong>Provider:</strong> {String(result.provider || "—")}</span><span><strong>Model:</strong> {String(result.model_used || "—")}</span></div></div>;
}

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  sources?: Array<{ source: string; category: string; subject: string; score: number }>;
  sourceCount?: number;
};

const chatSuggestions = [
  "What are the important DSA topics for placements?",
  "Explain normalization in DBMS",
  "How should I prepare for technical interviews?",
  "What topics should I study for aptitude?",
];

function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    text: "Hello! I’m your AI Buddy. I can help you prepare for DSA, aptitude, DBMS, Operating Systems, OOP, Computer Networks, coding, interviews, resumes, and placements.",
  }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedSources, setExpandedSources] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(message?: string, event?: FormEvent) {
    event?.preventDefault();
    const text = (message ?? input).trim();
    if (!text || sending) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", text }]);
    setSending(true);
    try {
      const data = await sendChatMessage(text);
      setMessages((current) => [...current, {
        role: "assistant",
        text: data.response || "I couldn’t find an answer for that.",
        sources: data.sources || [],
        sourceCount: data.source_count || data.sources?.length || 0,
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        role: "assistant",
        text: apiError(error, "I’m having trouble reaching AI Buddy right now. Please try again."),
      }]);
    } finally {
      setSending(false);
    }
  }

  return <><PageHeader eyebrow="AI TOOLKIT" title="AI Buddy" description="Ask focused questions and get practical, context-aware placement guidance." /><section className="chat-panel"><div className="chat-header"><div className="coach-avatar"><Bot size={21} /></div><div><strong>AI Buddy</strong><span><i className="online-dot" /> Online · Knowledge base connected</span></div><button className="button secondary" type="button" onClick={() => { setMessages([{ role: "assistant", text: "Hello! I’m your AI Buddy. Ask me anything about placement preparation." }]); setExpandedSources(null); }}>Clear</button></div><div className="messages">{messages.length === 1 && !sending && <div className="chat-suggestions">{chatSuggestions.map((suggestion) => <button className="chat-suggestion" type="button" key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div>}{messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><div className="message-avatar">{message.role === "assistant" ? <Bot size={15} /> : <UserRound size={15} />}</div><div className="message-bubble">{message.role === "assistant" ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown> : message.text}{message.role === "assistant" && message.sources?.length ? <div className="chat-sources"><button type="button" onClick={() => setExpandedSources(expandedSources === index ? null : index)}>Knowledge used · {message.sourceCount || message.sources.length} sources {expandedSources === index ? "▲" : "▼"}</button>{expandedSources === index && <div className="sources-list">{message.sources.map((source, sourceIndex) => <div className="source-item" key={`${source.source}-${sourceIndex}`}><span>{source.source}</span><span>{typeof source.score === "number" ? `${(source.score * 100).toFixed(1)}%` : ""}</span></div>)}</div>}</div> : null}</div></div>)}{sending && <div className="message-row assistant"><div className="message-avatar"><Bot size={15} /></div><div className="message-bubble typing"><i /><i /><i /></div></div>}<div ref={messagesEndRef} /></div><form className="chat-compose" onSubmit={(event) => void send(undefined, event)}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ask AI Buddy about DSA, DBMS, aptitude, coding, or interviews…" rows={1} /><button className="send-button" disabled={!input.trim() || sending} aria-label="Send message"><Send size={17} /></button></form></section></>;
}

function VoiceInterview() { const [mode, setMode] = useState("resume"); return <><PageHeader eyebrow="AI TOOLKIT" title="Practice the real conversation." description="Build confidence with a structured, AI-powered mock interview." /><section className="interview-setup panel"><div className="setup-intro"><div className="feature-icon violet"><Mic2 size={23} /></div><h2>Ready when you are.</h2><p className="muted">Choose a format and we’ll tailor the interview to your goals.</p></div><div className="mode-tabs"><button className={mode === "resume" ? "selected" : ""} onClick={() => setMode("resume")}><FileText size={18} /><strong>Resume-based</strong><span>Questions from your experience</span></button><button className={mode === "role" ? "selected" : ""} onClick={() => setMode("role")}><BriefcaseBusiness size={18} /><strong>Role-based</strong><span>Practice for a target role</span></button></div><div className="setup-fields"><label>Question count<select defaultValue="8"><option>5 questions</option><option>8 questions</option><option>10 questions</option></select></label><label>Focus area<select defaultValue="Balanced"><option>Balanced</option><option>Technical depth</option><option>Communication</option></select></label></div><button className="button primary"><Mic2 size={16} /> Start mock interview</button><p className="setup-note"><ShieldCheck size={14} /> Microphone access is only used during your live session.</p></section></>; }
function MockTests() { return <><PageHeader eyebrow="ASSESSMENTS" title="Mock tests" description="Measure your readiness in conditions that feel like the real thing." action={<Link className="button primary" to="/mocktest/live"><Play size={16} /> View live tests</Link>} /><div className="mock-hero"><div className="feature-icon orange"><Trophy size={21} /></div><div><span className="chip orange">NEXT MILESTONE</span><h2>Complete your first full mock.</h2><p>Timed practice helps you turn knowledge into performance.</p></div><div className="mock-stat"><strong>3</strong><span>tests completed</span></div></div><div className="section-heading spaced"><div><h2>Recent performance</h2><p className="muted">Review your latest assessment attempts.</p></div></div><div className="table-panel">{[["Full Stack Fundamentals","82%","Oct 18, 2025","Excellent"],["Aptitude Sprint #04","74%","Oct 12, 2025","Good"],["Core CS Concepts","68%","Oct 05, 2025","Keep going"]].map(row => <div className="table-row" key={row[0]}><span><strong>{row[0]}</strong><small>{row[2]}</small></span><strong className="score">{row[1]}</strong><span className="chip green">{row[3]}</span><button className="icon-button"><ChevronRight size={16} /></button></div>)}</div></>; }
