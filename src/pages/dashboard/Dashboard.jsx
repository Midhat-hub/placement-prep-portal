import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where
} from "firebase/firestore"
import { auth, db } from "@/firebase/firebase"
import {
	TargetIcon,
	BarChartIcon,
	CheckSquareIcon,
	CodeIcon,
	FileTextIcon,
	FileCheckIcon,
	CalendarIcon,
	ClockIcon,
	TrophyIcon,
	AlertTriangleIcon
} from "@/components/Icons"

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	PieChart,
	Pie,
	Cell,
	RadarChart,
	Radar,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	ResponsiveContainer
} from "recharts"

const COLORS = ["#0a6b99", "#ef4444"]

const MODULE_LABELS = [
	{ key: "dsa", label: "DSA" },
	{ key: "aptitude", label: "Aptitude" },
	{ key: "core", label: "Core" },
	{ key: "coding", label: "Coding" }
]

function toMillis(value) {
	if (!value) return 0
	if (typeof value.toMillis === "function") return value.toMillis()
	if (value instanceof Date) return value.getTime()
	if (typeof value === "string") {
		const parsed = Date.parse(value)
		return Number.isNaN(parsed) ? 0 : parsed
	}
	if (typeof value.seconds === "number") return value.seconds * 1000
	return 0
}

function safePercent(value) {
	return Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
}

function Dashboard() {
	const navigate = useNavigate()
	const [currentUser, setCurrentUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [chartTab, setChartTab] = useState("volume")

	const [stats, setStats] = useState({ aptitude: 0, core: 0, dsa: 0, coding: 0 })
	const [accuracy, setAccuracy] = useState({ correct: 0, wrong: 0 })
	const [hasResume, setHasResume] = useState(false)
	const [resumeStats, setResumeStats] = useState({ overall: 0, ats: 0 })
	const [mockStats, setMockStats] = useState({ upcoming: 0, lastScore: 0, bestScore: 0 })
	const [summary, setSummary] = useState({
		overallProgress: 0,
		accuracy: 0,
		totalAttempts: 0,
		codingSolved: 0
	})

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user)
			if (!user) setLoading(false)
		})

		return () => unsubscribe()
	}, [])

	useEffect(() => {
		if (!currentUser) {
			setStats({ aptitude: 0, core: 0, dsa: 0, coding: 0 })
			setAccuracy({ correct: 0, wrong: 0 })
			setHasResume(false)
			setResumeStats({ overall: 0, ats: 0 })
			setMockStats({ upcoming: 0, lastScore: 0, bestScore: 0 })
			setSummary({ overallProgress: 0, accuracy: 0, totalAttempts: 0, codingSolved: 0 })
			return
		}

		let cancelled = false

		async function loadDashboard() {
			setLoading(true)
			setError("")

			try {
				const [attemptsSnapshot, codingSnapshot, resumeSnapshot, mockProgressSnapshot, upcomingMocksSnapshot] = await Promise.all([
					getDocs(collection(db, "user_progress", currentUser.uid, "attempts")),
					getDocs(collection(db, "user_progress", currentUser.uid, "coding")),
					getDoc(doc(db, "user_progress", currentUser.uid, "resume", "latest")),
					getDocs(collection(db, "user_progress", currentUser.uid, "mock_tests")),
					getDocs(query(collection(db, "mockTests"), where("status", "==", "upcoming")))
				])

				if (cancelled) return

				let aptitude = 0
				let core = 0
				let dsa = 0
				let correct = 0
				let wrong = 0

				attemptsSnapshot.forEach((attemptDoc) => {
					const data = attemptDoc.data()
					const normalizedId = String(attemptDoc.id || "").toLowerCase()

					if (data.correct) correct += 1
					else wrong += 1

					if (normalizedId.includes("apt")) aptitude += 1
					else if (normalizedId.includes("core")) core += 1
					else dsa += 1
				})

				const coding = codingSnapshot.size
				const existsResume = resumeSnapshot.exists()
				setHasResume(existsResume)
				const resumeData = existsResume ? resumeSnapshot.data() : {}
				const overallScore = safePercent(resumeData.overall_score)
				const atsScore = safePercent(resumeData.ats_score)

				const mockAttempts = mockProgressSnapshot.docs.map((mockDoc) => ({
					id: mockDoc.id,
					...mockDoc.data()
				}))

				const lastMockAttempt = [...mockAttempts].sort(
					(a, b) => toMillis(b.submittedAt) - toMillis(a.submittedAt)
				)[0]

				const bestMockScore = mockAttempts.reduce((best, attempt) => {
					const score = Number(attempt.percentage ?? attempt.score ?? 0)
					return Math.max(best, Number.isFinite(score) ? score : 0)
				}, 0)

				const lastScore = Number(lastMockAttempt?.percentage ?? lastMockAttempt?.score ?? 0)
				const upcomingMocks = upcomingMocksSnapshot.size
				const totalAttempts = attemptsSnapshot.size
				const totalAnswered = correct + wrong
				const accuracyPercent = totalAnswered ? Math.round((correct / totalAnswered) * 100) : 0

				const compositeInputs = []
				if (totalAnswered) compositeInputs.push(accuracyPercent)
				if (existsResume) compositeInputs.push(overallScore)
				if (mockAttempts.length) compositeInputs.push(bestMockScore)

				const overallProgress = compositeInputs.length
					? Math.round(compositeInputs.reduce((sum, value) => sum + value, 0) / compositeInputs.length)
					: 0

				setStats({ aptitude, core, dsa, coding })
				setAccuracy({ correct, wrong })
				setResumeStats({ overall: overallScore, ats: atsScore })
				setMockStats({
					upcoming: upcomingMocks,
					lastScore: Number.isFinite(lastScore) ? Math.round(lastScore) : 0,
					bestScore: Math.round(bestMockScore)
				})
				setSummary({
					overallProgress,
					accuracy: accuracyPercent,
					totalAttempts,
					codingSolved: coding
				})
			} catch (loadError) {
				console.error(loadError)
				if (!cancelled) setError("Unable to load dashboard data from Firebase right now.")
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		loadDashboard()

		return () => {
			cancelled = true
		}
	}, [currentUser])

	const barData = [
		{ name: "DSA", value: stats.dsa },
		{ name: "Aptitude", value: stats.aptitude },
		{ name: "Core", value: stats.core },
		{ name: "Coding", value: stats.coding }
	]

	const pieData = [
		{ name: "Correct", value: accuracy.correct },
		{ name: "Wrong", value: accuracy.wrong }
	]

	const totalAnswered = accuracy.correct + accuracy.wrong

	const radarMax = Math.max(1, stats.dsa, stats.aptitude, stats.core, stats.coding)
	const radarData = useMemo(() => MODULE_LABELS.map((item) => ({
		subject: item.label,
		value: Math.round((stats[item.key] / radarMax) * 100)
	})), [radarMax, stats])

	const currentName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Student"

	if (loading) {
		return (
			<div className="page dashboard-viewport">
				<div className="dashboard-hero-compact" style={{ opacity: 0.85 }}>
					<div className="skeleton" style={{ width: "200px", height: "24px" }} />
					<div className="skeleton" style={{ width: "110px", height: "26px", borderRadius: "14px" }} />
				</div>

				<div className="summary-strip-compact">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="summary-card-compact" style={{ gap: "10px" }}>
							<div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "10px" }} />
							<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
								<div className="skeleton" style={{ width: "60px", height: "11px" }} />
								<div className="skeleton" style={{ width: "45px", height: "20px" }} />
							</div>
						</div>
					))}
				</div>

				<div className="dashboard-main-grid-compact">
					<div className="dashboard-panel-compact" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
						<div className="spinner" />
					</div>
					<div className="dashboard-panel-compact" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
						<div className="spinner" />
					</div>
					<div className="dashboard-right-stack">
						<div className="dashboard-panel-compact" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
							<div className="spinner" />
						</div>
						<div className="dashboard-panel-compact" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
							<div className="spinner" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="page dashboard-viewport">
			{/* ── COMPACT AT-A-GLANCE HEADER ──────────────────────── */}
			<div className="dashboard-hero-compact">
				<div className="dashboard-hero-left">
					<h1 className="dashboard-hero-title">
						Hello, {currentName}
						<span className="dashboard-hero-badge" style={{ background: "rgba(255,255,255,0.2)" }}>
							Readiness: {summary.overallProgress}%
						</span>
					</h1>
					<p className="dashboard-hero-sub">
						Placement readiness & learning progress overview
					</p>
				</div>

				<div className="dashboard-hero-right">
					<div className="dashboard-hero-badge">
						<span style={{ width: "7px", height: "7px", borderRadius: "50%", background: currentUser ? "var(--color-green)" : "var(--color-amber)", display: "inline-block" }} />
						{currentUser ? "Live Sync Active" : "Offline Mode"}
					</div>
					<button
						className="btn"
						onClick={() => navigate("/practice")}
						style={{
							fontSize: "11px",
							padding: "5px 12px",
							background: "rgba(255,255,255,0.18)",
							color: "#fff",
							border: "1px solid rgba(255,255,255,0.3)",
							borderRadius: "6px"
						}}
					>
						Practice Hub →
					</button>
				</div>
			</div>

			{error && (
				<div style={{ background: "var(--color-red-light)", borderLeft: "4px solid var(--color-red)", padding: "8px 14px", borderRadius: "var(--radius-sm)", color: "var(--color-red)", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
					<AlertTriangleIcon size={16} />
					<span>{error}</span>
				</div>
			)}

			{/* ── 4 COMPACT METRIC CARDS ──────────────────────── */}
			<div className="summary-strip-compact">
				<div className="summary-card-compact">
					<div className="summary-card-icon-wrap" style={{ background: "rgba(10, 107, 153, 0.1)", color: "var(--color-blue)" }}>
						<TargetIcon size={18} />
					</div>
					<div className="summary-card-info">
						<span className="summary-card-label">Readiness</span>
						<strong className="summary-card-value" style={{ color: "var(--color-blue)" }}>{summary.overallProgress}%</strong>
						<span className="summary-card-sub">Composite score</span>
					</div>
				</div>

				<div className="summary-card-compact">
					<div className="summary-card-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--color-green)" }}>
						<BarChartIcon size={18} />
					</div>
					<div className="summary-card-info">
						<span className="summary-card-label">Accuracy Rate</span>
						<strong className="summary-card-value" style={{ color: summary.accuracy >= 70 ? "var(--color-green)" : "var(--color-navy)" }}>
							{summary.accuracy}%
						</strong>
						<span className="summary-card-sub">{accuracy.correct} of {totalAnswered || 0} correct</span>
					</div>
				</div>

				<div className="summary-card-compact">
					<div className="summary-card-icon-wrap" style={{ background: "rgba(5, 47, 63, 0.08)", color: "var(--color-navy)" }}>
						<CheckSquareIcon size={18} />
					</div>
					<div className="summary-card-info">
						<span className="summary-card-label">MCQs Solved</span>
						<strong className="summary-card-value">{summary.totalAttempts}</strong>
						<span className="summary-card-sub">Practice questions</span>
					</div>
				</div>

				<div className="summary-card-compact">
					<div className="summary-card-icon-wrap" style={{ background: "rgba(24, 160, 214, 0.12)", color: "var(--color-blue-light)" }}>
						<CodeIcon size={18} />
					</div>
					<div className="summary-card-info">
						<span className="summary-card-label">Coding Problems</span>
						<strong className="summary-card-value" style={{ color: "var(--color-green)" }}>{summary.codingSolved}</strong>
						<span className="summary-card-sub">Algorithms submitted</span>
					</div>
				</div>
			</div>

			{/* ── MAIN AT-A-GLANCE GRID (NO SCROLL ON DESKTOP) ──────────────────────── */}
			<div className="dashboard-main-grid-compact">
				{/* ── COLUMN 1: MODULE ANALYTICS & SKILL BALANCE (TABBED) ──── */}
				<div className="dashboard-panel-compact">
					<div className="dashboard-panel-header">
						<div>
							<h2>Module Analytics</h2>
							<span>{chartTab === "volume" ? "Attempts per category" : "Syllabus balance radar"}</span>
						</div>
						<div className="chart-tab-switcher">
							<button
								className={`chart-tab-btn ${chartTab === "volume" ? "active" : ""}`}
								onClick={() => setChartTab("volume")}
							>
								Volume
							</button>
							<button
								className={`chart-tab-btn ${chartTab === "radar" ? "active" : ""}`}
								onClick={() => setChartTab("radar")}
							>
								Skill Radar
							</button>
						</div>
					</div>

					<div className="dashboard-panel-body">
						{chartTab === "volume" ? (
							<>
								<div style={{ flex: 1, minHeight: 0, width: "100%" }}>
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
											<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-grey-border)" />
											<XAxis dataKey="name" tick={{ fill: "var(--color-grey-muted)", fontSize: 11 }} />
											<YAxis allowDecimals={false} tick={{ fill: "var(--color-grey-muted)", fontSize: 11 }} />
											<Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-grey-border)", fontSize: "12px", boxShadow: "var(--shadow-sm)" }} />
											<Bar dataKey="value" fill="#0a6b99" radius={[4, 4, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								</div>
								<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid var(--color-grey-border)" }}>
									{barData.map((d) => (
										<div key={d.name} style={{ textAlign: "center", background: "var(--color-grey-bg)", padding: "4px 2px", borderRadius: "6px" }}>
											<div style={{ fontSize: "10px", color: "var(--color-grey-muted)", fontWeight: 600 }}>{d.name}</div>
											<div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-navy)" }}>{d.value}</div>
										</div>
									))}
								</div>
							</>
						) : (
							<div style={{ flex: 1, minHeight: 0, width: "100%" }}>
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart data={radarData} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
										<PolarGrid stroke="var(--color-grey-border)" />
										<PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-navy)", fontSize: 11, fontWeight: 600 }} />
										<PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
										<Radar
											name="Skill balance"
											dataKey="value"
											stroke="#0a6b99"
											fill="#0a6b99"
											fillOpacity={0.25}
										/>
										<Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-grey-border)", fontSize: "12px" }} />
									</RadarChart>
								</ResponsiveContainer>
							</div>
						)}
					</div>
				</div>

				{/* ── COLUMN 2: ACCURACY BREAKDOWN ──── */}
				<div className="dashboard-panel-compact">
					<div className="dashboard-panel-header">
						<div>
							<h2>Accuracy Breakdown</h2>
							<span>Correct vs incorrect distribution</span>
						</div>
					</div>

					<div className="dashboard-panel-body" style={{ alignItems: "center", justifyContent: "center", gap: "8px" }}>
						<div style={{ width: "100%", height: "155px", position: "relative" }}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={pieData}
										cx="50%"
										cy="50%"
										innerRadius={46}
										outerRadius={68}
										paddingAngle={4}
										dataKey="value"
									>
										{pieData.map((item, index) => (
											<Cell key={item.name} fill={COLORS[index]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-grey-border)", fontSize: "12px" }} />
								</PieChart>
							</ResponsiveContainer>
							<div style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								textAlign: "center",
								pointerEvents: "none"
							}}>
								<div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-navy)", lineHeight: 1 }}>
									{summary.accuracy}%
								</div>
								<div style={{ fontSize: "9px", color: "var(--color-grey-muted)", textTransform: "uppercase", fontWeight: 600 }}>
									Correct
								</div>
							</div>
						</div>

						<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(10, 107, 153, 0.08)", padding: "6px 10px", borderRadius: "6px" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-blue)", display: "flex", alignItems: "center", gap: "6px" }}>
									<span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0a6b99" }} />
									Correct Answers
								</span>
								<strong style={{ fontSize: "12px", color: "var(--color-navy)" }}>{accuracy.correct}</strong>
							</div>

							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 68, 68, 0.08)", padding: "6px 10px", borderRadius: "6px" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-red)", display: "flex", alignItems: "center", gap: "6px" }}>
									<span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
									Incorrect Answers
								</span>
								<strong style={{ fontSize: "12px", color: "var(--color-navy)" }}>{accuracy.wrong}</strong>
							</div>

							<div style={{ textAlign: "center", fontSize: "11px", color: "var(--color-grey-muted)", marginTop: "2px" }}>
								Total Attempted: <strong>{totalAnswered}</strong>
							</div>
						</div>
					</div>
				</div>

				{/* ── COLUMN 3: RESUME HEALTH + MOCK TESTS STACK ──── */}
				<div className="dashboard-right-stack">
					{/* RESUME HEALTH */}
					<div className="dashboard-panel-compact resume-card-compact">
						<div className="dashboard-panel-header">
							<div>
								<h2>Resume Health</h2>
								<span>AI parsing evaluation</span>
							</div>
							{hasResume && (
								<button
									className="btn"
									onClick={() => navigate("/resume")}
									style={{ fontSize: "11px", padding: "3px 8px", color: "var(--color-blue)", background: "transparent", border: "none" }}
								>
									View Analysis →
								</button>
							)}
						</div>

						{hasResume ? (
							<div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
								<div>
									<div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
										<span style={{ fontWeight: 600, color: "var(--color-navy)" }}>Overall Score</span>
										<strong style={{ color: resumeStats.overall >= 75 ? "var(--color-green)" : "var(--color-blue)" }}>
											{resumeStats.overall}%
										</strong>
									</div>
									<div className="progress-bar-track" style={{ height: "6px" }}>
										<div
											className="progress-bar-fill"
											style={{
												width: `${resumeStats.overall}%`,
												background: resumeStats.overall >= 75 ? "var(--color-green)" : "var(--color-blue)"
											}}
										/>
									</div>
								</div>

								<div>
									<div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
										<span style={{ fontWeight: 600, color: "var(--color-navy)" }}>ATS Compatibility</span>
										<strong style={{ color: resumeStats.ats >= 70 ? "var(--color-green)" : "var(--color-amber)" }}>
											{resumeStats.ats}%
										</strong>
									</div>
									<div className="progress-bar-track" style={{ height: "6px" }}>
										<div
											className="progress-bar-fill ats"
											style={{
												width: `${resumeStats.ats}%`,
												background: resumeStats.ats >= 70 ? "var(--color-green)" : "var(--color-amber)"
											}}
										/>
									</div>
								</div>
							</div>
						) : (
							<div style={{ textAlign: "center", padding: "10px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
								<FileCheckIcon size={24} color="var(--color-grey-muted)" style={{ margin: "0 auto 4px auto", display: "block" }} />
								<p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "var(--color-grey-muted)" }}>No resume uploaded yet</p>
								<button
									className="btn btn-primary"
									onClick={() => navigate("/resume")}
									style={{ fontSize: "11px", padding: "4px 12px" }}
								>
									Upload Resume
								</button>
							</div>
						)}
					</div>

					{/* MOCK TESTS PERFORMANCE */}
					<div className="dashboard-panel-compact mock-card-compact">
						<div className="dashboard-panel-header">
							<div>
								<h2>Mock Tests</h2>
								<span>Exam performance</span>
							</div>
							<button
								className="btn"
								onClick={() => navigate("/mocktest")}
								style={{ fontSize: "11px", padding: "3px 8px", color: "var(--color-blue)", background: "transparent", border: "none" }}
							>
								Mock Hub →
							</button>
						</div>

						<div className="mock-metric-tiles-compact">
							<div className="metric-tile-compact">
								<span>
									<CalendarIcon size={12} color="var(--color-grey-muted)" />
									Upcoming
								</span>
								<strong style={{ color: "var(--color-blue)" }}>{mockStats.upcoming}</strong>
							</div>

							<div className="metric-tile-compact">
								<span>
									<ClockIcon size={12} color="var(--color-grey-muted)" />
									Latest
								</span>
								<strong style={{ color: mockStats.lastScore >= 60 ? "var(--color-green)" : "var(--color-navy)" }}>
									{mockStats.lastScore}%
								</strong>
							</div>

							<div className="metric-tile-compact">
								<span>
									<TrophyIcon size={12} color="var(--color-grey-muted)" />
									Best
								</span>
								<strong style={{ color: "var(--color-green)" }}>{mockStats.bestScore}%</strong>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard