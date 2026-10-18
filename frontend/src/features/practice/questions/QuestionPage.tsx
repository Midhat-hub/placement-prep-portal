import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { auth, db } from "../../../services/firebase/client";

type Question = { question?: string; options?: string[]; answer?: string; difficulty?: string; explanation?: string };
export default function QuestionPage() {
  const { collectionName = "aptitude", id = "" } = useParams();
  const [question, setQuestion] = useState<Question>();
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<boolean>();
  const [started] = useState(Date.now());
  useEffect(() => { const path = collectionName === "company_aptitude" ? doc(db, "company_prep", "company_aptitude", "items", id) : doc(db, "questions", collectionName, "items", id); getDoc(path).then((snapshot) => setQuestion(snapshot.data() as Question | undefined)); }, [collectionName, id]);
  async function submit() { if (!selected || !question) return; const correct = selected === question.answer; setResult(correct); if (auth.currentUser) await setDoc(doc(db, "user_progress", auth.currentUser.uid, "attempts", id), { correct, timeTaken: Math.floor((Date.now() - started) / 1000), attemptedAt: new Date().toISOString() }, { merge: true }); }
  if (!question) return <div className="empty-state"><p className="muted">Loading question…</p></div>;
  return <><PageHeader eyebrow={`${collectionName} PRACTICE`} title="Practice question" description="Submit your answer to record this attempt in your Firebase progress." /><section className="panel question-panel"><span className={`difficulty ${(question.difficulty || "").toLowerCase()}`}>{question.difficulty || "Standard"}</span><h2>{question.question}</h2><div className="answer-options">{(question.options || []).map((option) => <button className={selected === option ? "answer-option selected" : "answer-option"} onClick={() => setSelected(option)} key={option}>{option}</button>)}</div><button className="button primary" disabled={!selected || result !== undefined} onClick={() => void submit()}>Submit answer</button>{result !== undefined && <div className={result ? "result-success answer-result" : "result-error answer-result"}>{result ? <Check size={16} /> : <X size={16} />}{result ? "Correct answer" : "Not quite. Review the correct answer and try another question."}{question.explanation && <p>{question.explanation}</p>}</div>}</section></>;
}
