import { ArrowRight, CheckCircle2, MessageCircle, Target, Trophy } from "lucide-react";

type FeedbackSection = {
  assessment?: string;
  strengths?: string[];
  areasToImprove?: string[];
  missingPoints?: string[];
};

type QuestionFeedback = {
  questionNumber?: number;
  question?: string;
  answer?: string;
  assessment?: string;
  whatWasGood?: string;
  whatCouldImprove?: string;
};

type RecordedQuestion = {
  questionNumber?: number;
  question?: string;
  answer?: string;
};

export type InterviewFeedbackData = {
  role?: string;
  focus?: string;
  duration?: number;
  questions?: RecordedQuestion[];
  feedback?: {
    summary?: string;
    technical?: FeedbackSection;
    completeness?: FeedbackSection;
    reasoning?: FeedbackSection;
    communication?: FeedbackSection;
    questionFeedback?: QuestionFeedback[];
    recommendations?: string[];
  };
  evaluationError?: string;
};

function FeedbackList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return <div className="interview-feedback-list"><h4>{title}</h4><ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul></div>;
}

function AssessmentCard({ title, icon, section, secondary }: { title: string; icon: React.ReactNode; section?: FeedbackSection; secondary?: FeedbackSection }) {
  return <article className="interview-feedback-card"><div className="interview-feedback-card-title"><span className="feedback-icon">{icon}</span><h2>{title}</h2></div><p className="muted">{section?.assessment || "No assessment was returned for this area."}</p><FeedbackList title="Strengths" items={section?.strengths} /><FeedbackList title="Areas to improve" items={section?.areasToImprove} />{secondary && <><p className="interview-feedback-secondary">{secondary.assessment || "No reasoning assessment was returned."}</p><FeedbackList title="Reasoning strengths" items={secondary.strengths} /><FeedbackList title="Reasoning areas to improve" items={secondary.areasToImprove} /><FeedbackList title="Missing points" items={section?.missingPoints} /></>}</article>;
}

export default function InterviewFeedback({ interview, onReset }: { interview: InterviewFeedbackData; onReset: () => void }) {
  const feedback = interview.feedback || {};
  const recordedQuestions = interview.questions || [];
  const evaluatorFeedback = feedback.questionFeedback || [];
  const evaluatorByNumber = new Map(
    evaluatorFeedback.map((item, index) => [item.questionNumber || index + 1, item]),
  );
  const questionFeedback = recordedQuestions.length
    ? recordedQuestions.map((recordedQuestion, index) => ({
        ...evaluatorByNumber.get(recordedQuestion.questionNumber || index + 1),
        questionNumber: recordedQuestion.questionNumber || index + 1,
        question: recordedQuestion.question,
        answer: recordedQuestion.answer,
      }))
    : evaluatorFeedback.map((item, index) => ({
        ...item,
        questionNumber: item.questionNumber || index + 1,
      }));
  return <div className="interview-feedback-page"><div className="interview-feedback-hero"><p className="eyebrow">INTERVIEW COMPLETE</p><h1>Your interview feedback</h1><p className="muted">{feedback.summary || "Your evaluator has reviewed the recorded conversation."}</p>{interview.evaluationError && <div className="alert error">{interview.evaluationError}</div>}</div><section className="interview-feedback-overview"><div><span>Target role</span><strong>{interview.role || "Not specified"}</strong></div><div><span>Focus areas</span><strong>{interview.focus || "General readiness"}</strong></div><div><span>Duration</span><strong>{Math.round((interview.duration || 0) / 60)} min</strong></div><div><span>Questions</span><strong>{interview.questions?.length || questionFeedback.length}</strong></div></section><section className="interview-feedback-grid"><AssessmentCard title="Technical assessment" icon={<Target size={17} />} section={feedback.technical} /><AssessmentCard title="Communication assessment" icon={<MessageCircle size={17} />} section={feedback.communication} /><AssessmentCard title="Completeness and reasoning" icon={<CheckCircle2 size={17} />} section={feedback.completeness} secondary={feedback.reasoning} /></section><section className="interview-feedback-card interview-question-card"><div className="interview-feedback-card-title"><span className="feedback-icon"><Trophy size={17} /></span><h2>Question-wise feedback</h2></div>{questionFeedback.length ? <div className="interview-question-list">{questionFeedback.map((item, index) => <article key={`${item.questionNumber || index}`}><span className="interview-feedback-number">Q{item.questionNumber || index + 1}</span><div>{item.question && <p className="interview-feedback-prompt"><strong>Question:</strong> {item.question}</p>}{item.answer && <p className="interview-feedback-answer"><strong>Your answer:</strong> {item.answer}</p>}<h3>{item.assessment || "Response reviewed"}</h3><p><strong>What was good:</strong> {item.whatWasGood || "No specific positive observation was returned."}</p><p><strong>What could improve:</strong> {item.whatCouldImprove || "Continue developing a clearer, more complete response."}</p></div></article>)}</div> : <p className="muted">No recorded questions were returned for this session.</p>}<FeedbackList title="Recommended preparation topics" items={feedback.recommendations} /></section><button className="button primary" onClick={onReset}>Create another interview <ArrowRight size={16} /></button></div>;
}
