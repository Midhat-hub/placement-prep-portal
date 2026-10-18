import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { auth, db } from "../../services/firebase/client";

type Question = { question?: string; answer?: string; explanation?: string; options?: string[] };
type Mock = { title?: string; questions?: Question[] };
export default function MockReviewPage() {
  const { mockId = "" } = useParams();
  const [mock, setMock] = useState<Mock>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  useEffect(() => { async function load() { const [mockDoc, attemptDoc] = await Promise.all([getDoc(doc(db, "mockTests", mockId)), auth.currentUser ? getDoc(doc(db, "user_progress", auth.currentUser.uid, "mock_tests", mockId)) : Promise.resolve(null)]); setMock(mockDoc.data() as Mock | undefined); if (attemptDoc?.exists()) setAnswers((attemptDoc.data().answers || {}) as Record<string, string>); } void load(); }, [mockId]);
  if (!mock) return <div className="empty-state"><p className="muted">Loading review…</p></div>;
  return <><PageHeader eyebrow="ASSESSMENT REVIEW" title={mock.title || "Mock review"} description="Review the questions and answers recorded for this assessment." /><div className="review-list">{(mock.questions || []).map((question, index) => { const selected = answers[index]; const correct = selected === question.answer; return <section className="panel review-item" key={index}><div className="review-label">Question {index + 1} {selected ? correct ? <span className="chip green"><Check size={12} /> Correct</span> : <span className="chip orange"><X size={12} /> Incorrect</span> : <span className="chip">Not answered</span>}</div><h3>{question.question}</h3><p className="muted">Your answer: {selected || "Not answered"}</p><p className="muted">Correct answer: {question.answer || "Not provided"}</p>{question.explanation && <p className="review-explanation">{question.explanation}</p>}</section>; })}</div></>;
}
