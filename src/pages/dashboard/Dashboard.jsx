import { useEffect, useMemo, useState } from "react"
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
	const [currentUser, setCurrentUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	const [stats, setStats] = useState({ aptitude: 0, core: 0, dsa: 0, coding: 0 })
	const [accuracy, setAccuracy] = useState({ correct: 0, wrong: 0 })
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
			setLoading(false)
		})

		return () => unsubscribe()
	}, [])

	useEffect(() => {
		if (!currentUser) {
			setStats({ aptitude: 0, core: 0, dsa: 0, coding: 0 })
			setAccuracy({ correct: 0, wrong: 0 })
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
				const resumeData = resumeSnapshot.exists() ? resumeSnapshot.data() : {}
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
				if (resumeSnapshot.exists()) compositeInputs.push(overallScore)
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

	const radarMax = Math.max(1, stats.dsa, stats.aptitude, stats.core, stats.coding)
	const radarData = useMemo(() => MODULE_LABELS.map((item) => ({
		subject: item.label,
		value: Math.round((stats[item.key] / radarMax) * 100)
	})), [radarMax, stats])

	const currentName = currentUser?.displayName || "Student"

	if (loading) {
		return (
			<div className="page dashboard-page">
				<div className="dashboard-loading">Loading dashboard from Firebase...</div>
			</div>
		)
	}

	return (
		<div className="page dashboard-page">
			<div className="dashboard-hero">
				<div>
					<span className="dashboard-eyebrow">Live Dashboard</span>
					<h1 className="page-heading dashboard-title">Hello, {currentName}</h1>
					
				</div>

				<div className="dashboard-badge">{currentUser ? "Connected" : "Sign in to load data"}</div>
			</div>

			{error && <div className="dashboard-alert">{error}</div>}

			<div className="summary-strip">
				<div className="summary-card">
					<span className="summary-label">Overall Progress</span>
					<strong className="summary-value">{summary.overallProgress}%</strong>
					<span className="summary-note">Composite from practice, resume, and mock performance</span>
				</div>
				<div className="summary-card">
					<span className="summary-label">Accuracy</span>
					<strong className="summary-value">{summary.accuracy}%</strong>
					<span className="summary-note">Correct answers across all attempts</span>
				</div>
				<div className="summary-card">
					<span className="summary-label">Total Attempts</span>
					<strong className="summary-value">{summary.totalAttempts}</strong>
					<span className="summary-note">Question attempts </span>
				</div>
				<div className="summary-card">
					<span className="summary-label">Coding Problems Solved</span>
					<strong className="summary-value">{summary.codingSolved}</strong>
					
				</div>
			</div>

			<div className="dashboard-grid">
				<div className="dashboard-card chart-panel">
					<div className="card-header-row">
						<h2>Module Performance</h2>
						<span>Attempt volume by module</span>
					</div>
					<div className="chart-frame">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={barData}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="name" />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="value" fill="#0a6b99" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="dashboard-card chart-panel">
					<div className="card-header-row">
						<h2>Accuracy Split</h2>
						<span>Correct vs wrong answers</span>
					</div>
					<div className="chart-frame">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={pieData}
									cx="50%"
									cy="50%"
									innerRadius={65}
									outerRadius={105}
									paddingAngle={3}
									dataKey="value"
								>
									{pieData.map((item, index) => (
										<Cell key={item.name} fill={COLORS[index]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="dashboard-grid dashboard-grid-secondary">
				<div className="dashboard-card chart-panel">
					<div className="card-header-row">
						<h2>Skill Balance</h2>
						<span>Balanced across DSA, Aptitude, Core, and Coding</span>
					</div>
					<div className="chart-frame tall">
						<ResponsiveContainer width="100%" height="100%">
							<RadarChart data={radarData}>
								<PolarGrid />
								<PolarAngleAxis dataKey="subject" />
								<PolarRadiusAxis angle={30} domain={[0, 100]} />
								<Radar
									name="Skill balance"
									dataKey="value"
									stroke="#0a6b99"
									fill="#0a6b99"
									fillOpacity={0.25}
								/>
								<Tooltip />
							</RadarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="dashboard-card resume-panel">
					<div className="card-header-row">
						<h2>Resume Progress</h2>
						<span>Latest analysis scores</span>
					</div>

					<div className="progress-block">
						<div className="progress-row">
							<div className="progress-meta">
								<strong>Overall Score</strong>
								<span>{resumeStats.overall}%</span>
							</div>
							<div className="progress-bar-track">
								<div className="progress-bar-fill" style={{ width: `${resumeStats.overall}%` }} />
							</div>
						</div>

						<div className="progress-row">
							<div className="progress-meta">
								<strong>ATS Score</strong>
								<span>{resumeStats.ats}%</span>
							</div>
							<div className="progress-bar-track">
								<div className="progress-bar-fill ats" style={{ width: `${resumeStats.ats}%` }} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="dashboard-card mock-panel">
				<div className="card-header-row">
					<h2>Mock Test Snapshot</h2>
				</div>

				<div className="mock-metrics">
					<div className="metric-tile">
						<span>Upcoming Mocks</span>
						<strong>{mockStats.upcoming}</strong>
					</div>
					<div className="metric-tile">
						<span>Last Score</span>
						<strong>{mockStats.lastScore}%</strong>
					</div>
					<div className="metric-tile">
						<span>Best Score</span>
						<strong>{mockStats.bestScore}%</strong>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard