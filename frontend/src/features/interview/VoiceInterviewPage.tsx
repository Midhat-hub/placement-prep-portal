import { FormEvent, useState } from "react";
import { FileText, Mic2, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { apiError } from "../../services/api/client";
import { startInterview } from "../../services/api/interviewApi";

export default function VoiceInterviewPage() {
  const [mode, setMode] = useState<"resume_based" | "role_based">("resume_based");
  const [role, setRole] = useState("");
  const [resume, setResume] = useState<File>();
  const [jobDescription, setJobDescription] = useState("");
  const [focus, setFocus] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [starting, setStarting] = useState(false);
  const [session, setSession] = useState<{ id: string }>();
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (mode === "resume_based" && !resume) {
      setError("Upload a resume before starting a resume-based interview.");
      return;
    }
    if (mode === "role_based" && !role.trim()) {
      setError("Add a target role before starting a role-based interview.");
      return;
    }
    setStarting(true);
    try {
      const response = await startInterview({ mode, role, jobDescription, questionCount, focus, resume });
      setSession(response.interview);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to create the interview session."));
    } finally {
      setStarting(false);
    }
  }

  if (session) {
    return <><PageHeader eyebrow="VOICE INTERVIEW" title="Interview session created" description={`Session ${session.id} is ready. The live audio room can now be connected to the backend session.`} /><section className="panel interview-setup"><div className="empty-state"><div className="empty-icon"><Mic2 size={24} /></div><h3>Your session is ready</h3><p className="muted">The backend has created the interview and stored its context. Start the live room from the connected interview client when audio permissions are available.</p><button className="button primary" onClick={() => setSession(undefined)}>Create another session</button></div></section></>;
  }

  return <><PageHeader eyebrow="AI TOOLKIT" title="Practice the real conversation." description="Create a backend-backed voice interview session tailored to your preparation goals." /><form className="panel interview-setup" onSubmit={submit}><div className="setup-intro"><div className="feature-icon violet"><Mic2 size={23} /></div><h2>Ready when you are.</h2><p className="muted">Choose a format and the interviewer will use this context for its questions.</p></div><div className="mode-tabs"><button type="button" className={mode === "resume_based" ? "selected" : ""} onClick={() => setMode("resume_based")}><FileText size={18} /><strong>Resume-based</strong><span>Questions from your experience</span></button><button type="button" className={mode === "role_based" ? "selected" : ""} onClick={() => setMode("role_based")}><Mic2 size={18} /><strong>Role-based</strong><span>Practice for a target role</span></button></div><div className="setup-fields"><label>Question count<select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}><option value={5}>5 questions</option><option value={8}>8 questions</option><option value={10}>10 questions</option></select></label>{mode === "role_based" ? <label>Target role<input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend Engineer" /></label> : <label>Resume file<input type="file" accept=".pdf,.docx" onChange={(e) => setResume(e.target.files?.[0])} /></label>}</div>{mode === "role_based" && <label className="field-label">Job description<textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} placeholder="Paste the role description (optional)…" /></label>}<label className="field-label">Focus areas<textarea value={focus} onChange={(e) => setFocus(e.target.value)} rows={4} placeholder="e.g. Java, Spring Boot, system design…" /></label>{error && <div className="alert error">{error}</div>}<button className="button primary full" disabled={starting}>{starting ? "Creating session…" : "Create interview session"}<Mic2 size={16} /></button><p className="setup-note"><ShieldCheck size={14} /> Your Firebase ID token is sent to the protected interview API.</p></form></>;
}
