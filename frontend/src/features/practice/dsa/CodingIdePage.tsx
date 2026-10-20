import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Moon, Play, Sun, Terminal, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { db, auth } from "../../../services/firebase/client";
import { submitCode } from "../../../services/api/codingApi";
import { apiError } from "../../../services/api/client";
import { PageHeader } from "../../../components/PageHeader";

type Problem = {
  title?: string;
  description?: string;
  problem_statement?: string;
  category?: string;
  difficulty?: string;
  constraints?: string[];
  examples?: Array<{ input?: string; output?: string; explanation?: string }>;
  starter_code?: Record<string, string>;
};

export default function CodingIdePage() {
  const { id = "" } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [darkEditor, setDarkEditor] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function loadProblem() {
      try {
        const snapshot = await getDoc(doc(db, "coding_questions", id));
        if (cancelled) return;
        if (!snapshot.exists()) {
          setProblem(null);
          return;
        }
        const data = snapshot.data() as Problem;
        setProblem(data);
        setCode(data.starter_code?.python || "");
      } catch {
        if (!cancelled) setLoadError("Unable to load this coding problem. Check your Firebase connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadProblem();
    return () => { cancelled = true; };
  }, [id]);
  function changeLanguage(value: string) { setLanguage(value); setCode(problem?.starter_code?.[value] || ""); setResult(null); }
  function resultMessage() {
    if (!result) return "";
    return String(result.message || result.status || "Submission completed.");
  }
  async function run() { if (!code.trim()) { setResult({ status: "error", message: "Write some code before submitting." }); return; } setSubmitting(true); setResult(null); try { const data = await submitCode({ problem_id: id, language, source_code: code }); setResult(data); if (data.status === "accepted" && auth.currentUser) await setDoc(doc(db, "user_progress", auth.currentUser.uid, "coding", id), { completed: true, completedAt: new Date().toISOString() }, { merge: true }); } catch (error) { setResult({ status: "error", message: apiError(error, "Submission failed.") }); } finally { setSubmitting(false); } }
  if (loading) return <div className="empty-state"><p className="muted">Loading coding workspace…</p></div>;
  if (loadError) return <div className="empty-state"><h3>Unable to load workspace</h3><p className="muted">{loadError}</p><Link className="button primary" to="/practice/dsa-coding">Back to challenges</Link></div>;
  if (!problem) return <div className="empty-state"><h3>Problem not found</h3><Link className="button primary" to="/practice/dsa-coding">Back to challenges</Link></div>;
  return <><PageHeader eyebrow="CODING WORKSPACE" title={problem.title || "Coding challenge"} description="Read the prompt, write your solution, and submit it to the existing coding judge." action={<Link className="button" to="/practice/dsa-coding"><ArrowLeft size={15} /> All challenges</Link>} /><div className={`coding-layout ${darkEditor ? "editor-dark" : "editor-light"}`}><section className="panel problem-panel"><div className="problem-copy"><div className="coding-problem-meta"><span>{problem.category || "Algorithms"}</span><b className={`difficulty ${(problem.difficulty || "").toLowerCase()}`}>{problem.difficulty || "Standard"}</b></div><h3>Problem statement</h3><p>{problem.description || problem.problem_statement || "Solve the challenge using the constraints and examples below."}</p>{problem.constraints?.length ? <><h4>Constraints</h4><ul>{problem.constraints.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></> : null}{problem.examples?.length ? <><h4>Examples</h4>{problem.examples.map((example, index) => <div className="example" key={index}><strong>Example {index + 1}</strong><code>Input: {example.input || "—"}{"\n"}Output: {example.output || "—"}</code>{example.explanation && <p>{example.explanation}</p>}</div>)}</> : null}</div></section><section className="panel editor-panel"><div className="editor-toolbar"><select value={language} onChange={(e) => changeLanguage(e.target.value)}><option value="python">Python</option><option value="java">Java</option><option value="cpp">C++</option><option value="javascript">JavaScript</option></select><div className="editor-actions"><button className="button" type="button" onClick={() => setDarkEditor((current) => !current)}>{darkEditor ? <><Sun size={15} /> Light</> : <><Moon size={15} /> Dark</>}</button><button className="button primary" type="button" onClick={() => void run()} disabled={submitting}><Play size={15} /> {submitting ? "Submitting…" : "Submit code"}</button></div></div><textarea className="code-editor" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" /><div className="execution-output"><div><Terminal size={15} /> Execution output</div>{result ? <div className={`submission-result ${result.status === "accepted" ? "result-success" : "result-error"}`}><strong>{result.status === "accepted" ? <><CheckCircle2 size={15} /> Accepted</> : <><XCircle size={15} /> {resultMessage()}</>}</strong>{result.status === "accepted" ? <p>All hidden test cases passed. {result.passed_tests ? `${String(result.passed_tests)} / ${String(result.total_tests)} tests passed.` : ""}</p> : result.failed_test ? <p>Failed on test case {String(result.failed_test)}.</p> : null}</div> : <p className="muted">Your test results will appear here.</p>}</div></section></div></>;
}
