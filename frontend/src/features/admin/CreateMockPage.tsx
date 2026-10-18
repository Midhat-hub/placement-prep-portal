import { FormEvent, useState } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { db } from "../../services/firebase/client";

export default function CreateMockPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (!title.trim() || !start || !end) { setError("Title, start time, and end time are required."); return; } try { await addDoc(collection(db, "mockTests"), { title: title.trim(), duration: Number(duration), questionCount: 0, questions: [], status: "upcoming", startTime: Timestamp.fromDate(new Date(start)), endTime: Timestamp.fromDate(new Date(end)), createdAt: Timestamp.now() }); navigate("/admin/upcoming-mocks"); } catch { setError("Unable to create the mock in Firestore."); } }
  return <><PageHeader eyebrow="ADMINISTRATION" title="Create mock test" description="Create a scheduled Firestore mock. Questions can be selected using the existing admin workflow." /><form className="panel form-panel" onSubmit={submit}><label className="field-label">Title<input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Full Stack Fundamentals" /></label><div className="setup-fields"><label>Duration (minutes)<input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} /></label><label>Start time<input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required /></label></div><label className="field-label">End time<input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required /></label>{error && <div className="alert error">{error}</div>}<button className="button primary">Create scheduled mock</button></form></>;
}
