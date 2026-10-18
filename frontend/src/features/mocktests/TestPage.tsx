import { useEffect, useState } from "react";
import { doc, getDoc, Timestamp, setDoc } from "firebase/firestore";
import { Check, Clock3, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { auth, db } from "../../services/firebase/client";

type Question = { question?: string; options?: string[]; answer?: string; explanation?: string };
type Mock = { title?: string; duration?: number; questions?: Question[] };

export default function TestPage() {
  const { mockId = "" } = useParams();
  const navigate = useNavigate();
  const [mock, setMock] = useState<Mock>();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState<number>();
  const [loading, setLoading] = useState(true);
  useEffect(() => { getDoc(doc(db, "mockTests", mockId)).then((snapshot) => { const data = snapshot.data() as Mock | undefined; setMock(data); setSeconds((data?.duration || 30) * 60); }).finally(() => setLoading(false)); }, [mockId]);
  useEffect(() => { if (loading || score !== undefined || seconds <= 0) return; const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [loading, score, seconds]);
  useEffect(() => { if (!loading && seconds === 0 && score === undefined) void submit(); }, [seconds]);
  const questions = mock?.questions || [];
  async function submit() { const marks = questions.reduce((total, question, i) => total + (answers[i] === question.answer ? 1 : 0), 0); if (auth.currentUser) await setDoc(doc(db, "user_progress", auth.currentUser.uid, "mock_tests", mockId), { mockId, title: mock?.title, score: marks, totalQuestions: questions.length, percentage: Math.round((marks / Math.max(questions.length, 1)) * 100), answers, submittedAt: Timestamp.now() }); setScore(marks); }
  if (loading) return <div className="empty-state"><p className="muted">Loading assessment environment…</p></div>;
  if (!mock) return <div className="empty-state"><h3>Mock test not found</h3></div>;
  if (score !== undefined) return <section className="panel result-card"><Trophy size={44} color="var(--orange)" /><p className="eyebrow">ASSESSMENT COMPLETE</p><h1>{score} / {questions.length}</h1><p className="muted">{Math.round((score / Math.max(questions.length, 1)) * 100)}% · {mock.title}</p><button className="button primary" onClick={() => navigate("/mocktest")}>Return to mock hub</button></section>;
  const question = questions[index];
  return <><PageHeader eyebrow="TIMED ASSESSMENT" title={mock.title || "Mock test"} description="Your answers are saved to your Firebase progress record when submitted." action={<span className="chip orange"><Clock3 size={14} /> {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>} /><section className="panel test-panel"><div className="test-progress"><span>Question {index + 1} of {questions.length}</span><span>{Object.keys(answers).length} answered</span></div><h2>{question?.question || "Question unavailable"}</h2><div className="answer-options">{(question?.options || []).map((option) => <button key={option} className={answers[index] === option ? "answer-option selected" : "answer-option"} onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}><span>{answers[index] === option ? <Check size={14} /> : null}</span>{option}</button>)}</div><div className="test-actions"><button className="button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>Previous</button>{index < questions.length - 1 ? <button className="button primary" onClick={() => setIndex((value) => value + 1)}>Next question</button> : <button className="button primary" onClick={() => void submit()}>Submit test</button>}</div></section></>;
}
