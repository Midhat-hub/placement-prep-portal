import { FormEvent, useMemo, useState } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ArrowLeft, ArrowRight, FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import coreQuestions from "../../../../datasets/core_questions.json";
import dsaQuestions from "../../../../datasets/dsa_questions.json";
import aptitudeQuestions from "../../../../datasets/general_aptitude.json";
import { PageHeader } from "../../components/PageHeader";
import { db } from "../../services/firebase/client";

type Question = {
  id?: string | number;
  question?: string;
  subject?: string;
  difficulty?: string;
  options?: unknown;
  answer?: string;
  correctAnswer?: string;
};

type SelectedQuestion = Question & { subject: string };

const sourceQuestions: SelectedQuestion[] = [
  ...(coreQuestions as Question[]).map((question) => ({ ...question, subject: question.subject || "core" })),
  ...(dsaQuestions as Question[]).map((question) => ({ ...question, subject: "dsa" })),
  ...(aptitudeQuestions as Question[]).map((question) => ({ ...question, subject: "aptitude" })),
];

export default function CreateMockPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<SelectedQuestion[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => sourceQuestions.filter((question) => {
    const term = search.trim().toLowerCase();
    return (!term || question.question?.toLowerCase().includes(term))
      && (category === "all" || question.subject === category);
  }), [category, search]);

  function toggleQuestion(question: SelectedQuestion, checked: boolean) {
    setSelected((current) => checked
      ? current.some((item) => item.question === question.question) ? current : [...current, question]
      : current.filter((item) => item.question !== question.question));
  }

  function validateSchedule() {
    if (!title.trim() || !date || !startTime || !endTime || !duration) return "Title, duration, date, start time, and end time are required.";
    if (!selected.length) return "Select at least one question before continuing.";
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const now = new Date();
    if (start < now) return "The mock start time cannot be in the past.";
    if (end <= start) return "End time must be after the start time.";
    if ((end.getTime() - start.getTime()) / 60000 < Number(duration)) return "The scheduling window must be at least as long as the test duration.";
    return "";
  }

  async function createMock(event: FormEvent) {
    event.preventDefault();
    const validationError = validateSchedule();
    if (validationError) { setError(validationError); return; }
    setError("");
    setSaving(true);
    try {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      await addDoc(collection(db, "mockTests"), {
        title: title.trim(),
        instructions: instructions.trim(),
        duration: Number(duration),
        startTime: Timestamp.fromDate(start),
        endTime: Timestamp.fromDate(end),
        status: "upcoming",
        questionCount: selected.length,
        questions: selected,
        createdAt: Timestamp.now(),
      });
      navigate("/admin/upcoming-mocks");
    } catch {
      setError("Unable to create the mock in Firestore. Check your admin access and try again.");
    } finally {
      setSaving(false);
    }
  }

  return <><PageHeader eyebrow="ADMINISTRATION" title="Create & schedule mock assessment" description="Select questions, set test parameters, and publish the assessment for students." action={<span className="chip blue">Step {step} of 2</span>} />{step === 1 ? <section className="admin-create-flow"><div className="panel"><div className="section-heading"><div><h2>Select questions</h2><p className="muted">{selected.length} questions selected</p></div><button className="button primary" type="button" onClick={() => { const validationError = selected.length ? "" : "Select at least one question before continuing."; setError(validationError); if (!validationError) setStep(2); }}>Continue <ArrowRight size={15} /></button></div><div className="feature-filter"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions…" /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All domains</option><option value="core">Core</option><option value="dsa">DSA</option><option value="aptitude">Aptitude</option></select></div><div className="admin-question-list">{filtered.map((question, index) => { const checked = selected.some((item) => item.question === question.question); return <label className="admin-question-option" key={`${question.subject}-${question.question || index}`}><input type="checkbox" checked={checked} onChange={(event) => toggleQuestion(question, event.target.checked)} /><span><strong>{question.question || "Untitled question"}</strong><small>{question.subject} · {question.difficulty || "Standard"}</small></span></label>; })}</div>{error && <div className="alert error">{error}</div>}</div></section> : <form className="admin-create-flow" onSubmit={createMock}><div className="panel"><div className="section-heading"><div><h2>Assessment scheduling</h2><p className="muted">{selected.length} questions confirmed</p></div><button className="button" type="button" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back to questions</button></div><label className="field-label">Test title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Campus Placement Aptitude Mock" /></label><div className="setup-fields"><label>Time limit (minutes)<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} /></label><label>Test date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Window start<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label>Window end<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label></div><label className="field-label">Candidate instructions<textarea rows={4} value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Instructions shown before the test begins…" /></label>{error && <div className="alert error">{error}</div>}<div className="form-actions"><button className="button" type="button" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button><button className="button primary" type="submit" disabled={saving}>{saving ? "Publishing…" : "Publish mock assessment"} <FileText size={15} /></button></div></div><div className="panel selected-question-summary"><h3>Selected questions</h3>{selected.map((question, index) => <div className="selected-question" key={`${question.question}-${index}`}><span>{index + 1}. {question.question}</span><button type="button" aria-label="Remove question" onClick={() => toggleQuestion(question, false)}><Trash2 size={14} /></button></div>)}</div></form>}</>;
}
