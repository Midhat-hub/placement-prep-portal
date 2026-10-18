import { useEffect, useState } from "react";
import { Check, Clock3, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";

type Question = { question?: string; options?: string[]; answer?: string; explanation?: string; subject?: string; category?: string };
type Session = { title: string; questions: Question[]; duration: number };
export default function PracticeMockPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState<number>();
  useEffect(() => { const stored = sessionStorage.getItem("practiceMock"); if (!stored) { navigate("/practice-test", { replace: true }); return; } const value = JSON.parse(stored) as Session; setSession(value); setSeconds(value.duration * 60); }, [navigate]);
  useEffect(() => { if (!session || score !== undefined || seconds <= 0) return; const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [session, score, seconds]);
  useEffect(() => { if (session && seconds === 0 && score === undefined) finish(); }, [seconds, session, score]);
  function finish() { if (!session) return; setScore(session.questions.reduce((total, question, itemIndex) => total + (answers[itemIndex] === question.answer ? 1 : 0), 0)); }
  if (!session) return <div className="empty-state"><p className="muted">Loading practice session…</p></div>;
  if (score !== undefined) return <section className="panel result-card"><Trophy size={44} color="var(--orange)" /><p className="eyebrow">PRACTICE COMPLETE</p><h1>{score} / {session.questions.length}</h1><p className="muted">{Math.round((score / Math.max(session.questions.length, 1)) * 100)}% · {Object.keys(answers).length} answered</p><button className="button primary" onClick={() => navigate("/practice-test")}>Take another test</button></section>;
  const question = session.questions[index];
  return <><PageHeader eyebrow="SELF-PACED PRACTICE" title={session.title} description={`${Object.keys(answers).length} of ${session.questions.length} answered`} action={<span className="chip orange"><Clock3 size={14} /> {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>} /><section className="panel test-panel"><div className="test-progress"><span>Question {index + 1} of {session.questions.length}</span><span>{question.category || question.subject || "Practice"}</span></div><h2>{question.question}</h2><div className="answer-options">{(question.options || []).map((option) => <button className={answers[index] === option ? "answer-option selected" : "answer-option"} key={option} onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}><span>{answers[index] === option && <Check size={14} />}</span>{option}</button>)}</div><div className="test-actions"><button className="button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>Previous</button>{index === session.questions.length - 1 ? <button className="button primary" onClick={finish}>Finish practice</button> : <button className="button primary" onClick={() => setIndex((value) => value + 1)}>Next question</button>}</div></section></>;
}
