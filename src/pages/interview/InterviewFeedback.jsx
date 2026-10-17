function InterviewFeedback({ interview }) {
  const feedback = interview.feedback || {}
  const technical = feedback.technical || {}
  const completeness = feedback.completeness || {}
  const reasoning = feedback.reasoning || {}
  const communication = feedback.communication || {}

  return (
    <main className="voice-interview-page">
      <section className="voice-interview-intro">
        <p className="voice-kicker">Interview complete</p>
        <h1>Your interview feedback</h1>
        <p>{feedback.summary || "Your evaluator has reviewed the recorded conversation."}</p>
        {interview.evaluationError && <p className="voice-form-error" role="alert">{interview.evaluationError}</p>}
      </section>

      <section className="voice-feedback-overview">
        <div><span>Target role</span><strong>{interview.role || "Not specified"}</strong></div>
        <div><span>Focus areas</span><strong>{interview.focus || "General readiness"}</strong></div>
        <div><span>Duration</span><strong>{Math.round((interview.duration || 0) / 60)} min</strong></div>
        <div><span>Questions</span><strong>{interview.questions?.length || 0}</strong></div>
      </section>

      <section className="voice-feedback-grid">
        <article className="voice-feedback-card">
          <h2>Technical assessment</h2>
          <p>{technical.assessment || "No technical assessment was returned."}</p>
          <FeedbackList title="Strengths" items={technical.strengths} />
          <FeedbackList title="Areas to improve" items={technical.areasToImprove} />
        </article>
        <article className="voice-feedback-card">
          <h2>Communication assessment</h2>
          <p>{communication.assessment || "No communication assessment was returned."}</p>
          <FeedbackList title="Strengths" items={communication.strengths} />
          <FeedbackList title="Areas to improve" items={communication.areasToImprove} />
        </article>
        <article className="voice-feedback-card">
          <h2>Completeness and reasoning</h2>
          <p>{completeness.assessment || "No completeness assessment was returned."}</p>
          <FeedbackList title="Missing points" items={completeness.missingPoints} />
          <p>{reasoning.assessment || "No reasoning assessment was returned."}</p>
          <FeedbackList title="Reasoning strengths" items={reasoning.strengths} />
          <FeedbackList title="Reasoning areas to improve" items={reasoning.areasToImprove} />
        </article>
      </section>

      <section className="voice-feedback-card">
        <h2>Question-wise feedback</h2>
        <div className="voice-question-feedback">
          {(feedback.questionFeedback || []).map((item) => (
            <article key={item.questionNumber}>
              <span className="voice-feedback-number">Q{item.questionNumber}</span>
              <div>
                <h3>{item.assessment}</h3>
                <p><strong>What was good:</strong> {item.whatWasGood}</p>
                <p><strong>What could improve:</strong> {item.whatCouldImprove}</p>
              </div>
            </article>
          ))}
        </div>
        <FeedbackList title="Recommended preparation topics" items={feedback.recommendations} />
      </section>
    </main>
  )
}

function FeedbackList({ title, items = [] }) {
  if (!items.length) return null
  return (
    <div className="voice-feedback-list">
      <h3>{title}</h3>
      <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
    </div>
  )
}

export default InterviewFeedback