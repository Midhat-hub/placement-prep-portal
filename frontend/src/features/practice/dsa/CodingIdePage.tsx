import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Play, Terminal } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { db, auth } from "../../../services/firebase/client";
import { submitCode } from "../../../services/api/codingApi";
import { apiError } from "../../../services/api/client";
import { PageHeader } from "../../../components/PageHeader";

type Problem = { title?: string; description?: string; problem_statement?: string; constraints?: string[]; examples?: Array<{ input?: string; output?: string }>; starter_code?: Record<string, string> };

export default function CodingIdePage() {
  const { id = "" } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { getDoc(doc(db, "coding_questions", id)).then((snapshot) => { const data = snapshot.exists() ? snapshot.data() as Problem : null; setProblem(data); setCode(data?.starter_code?.python || ""); }).finally(() => setLoading(false)); }, [id]);
  function changeLanguage(value: string) { setLanguage(value); setCode(problem?.starter_code?.[value] || ""); }
  async function run() { if (!code.trim()) { setResult({ status: "error", message: "Write some code before submitting." }); return; } setSubmitting(true); setResult(null); try { const data = await submitCode({ problem_id: id, language, source_code: code }); setResult(data); if (data.status === "accepted" && auth.currentUser) await setDoc(doc(db, "user_progress", auth.currentUser.uid, "coding", id), { completed: true, completedAt: new Date().toISOString() }, { merge: true }); } catch (error) { setResult({ status: "error", message: apiError(error, "Submission failed.") }); } finally { setSubmitting(false); } }
  if (loading) return <div className="empty-state"><p className="muted">Loading coding workspace…</p></div>;
  if (!problem) return <div className="empty-state"><h3>Problem not found</h3><Link className="button primary" to="/practice/dsa-coding">Back to challenges</Link></div>;
  return <><PageHeader eyebrow="CODING WORKSPACE" title={problem.title || "Coding challenge"} description="Read the prompt, write your solution, and submit it to the existing coding judge." action={<Link className="button" to="/practice/dsa-coding"><ArrowLeft size={15} /> All challenges</Link>} /><div className="coding-layout"><section className="panel problem-panel"><div className="problem-copy"><h3>Problem statement</h3><p>{problem.description || problem.problem_statement || "Solve the challenge using the constraints and examples below."}</p>{problem.constraints?.length ? <><h4>Constraints</h4><ul>{problem.constraints.map((item) => <li key={item}>{item}</li>)}</ul></> : null}{problem.examples?.map((example, index) => <div className="example" key={index}><strong>Example {index + 1}</strong><code>Input: {example.input || "—"}{"\n"}Output: {example.output || "—"}</code></div>)}</div></section><section className="panel editor-panel"><div className="editor-toolbar"><select value={language} onChange={(e) => changeLanguage(e.target.value)}><option value="python">Python</option><option value="java">Java</option><option value="cpp">C++</option><option value="javascript">JavaScript</option></select><button className="button primary" onClick={run} disabled={submitting}><Play size={15} /> {submitting ? "Running…" : "Run & submit"}</button></div><textarea className="code-editor" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} /><div className="execution-output"><div><Terminal size={15} /> Execution output</div>{result ? <p className={result.status === "accepted" ? "result-success" : "result-error"}>{result.status === "accepted" ? <CheckCircle2 size={15} /> : null}{String(result.message || result.status || "Submission completed.")}</p> : <p className="muted">Your test results will appear here.</p>}</div></section></div></>;
}
