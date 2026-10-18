import { useState } from "react";

export default function ConfirmTest({
  selectedQuestions,
  onBack,
  onCreateTest,
  submitting,
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [date, setDate] = useState("");
  const [beginTime, setBeginTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleCreate = () => {
    if (!title.trim()) {
      alert("Please enter test title");
      return;
    }

    if (!date) {
      alert("Please select a test date");
      return;
    }

    if (!beginTime || !endTime) {
      alert("Please select both begin and end times");
      return;
    }

    const now = new Date();
    const start = new Date(`${date}T${beginTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    // date must be today or in future
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (start < todayStart) {
      alert("Test date cannot be before today");
      return;
    }

    const minStart = new Date(now.getTime());
    if (start < minStart) {
      alert("Invalid Begin time (cannot be in the past)");
      return;
    }

    if (end <= start) {
      alert("End time must be after begin time");
      return;
    }

    // validate that duration is >= time limit
    const timeLimit = Number(time);
    if (!time || isNaN(timeLimit) || timeLimit <= 0) {
      alert("Please enter a valid time limit (minutes)");
      return;
    }

    const durationMinutes = (end.getTime() - start.getTime()) / (60 * 1000);
    if (durationMinutes < timeLimit) {
      alert("The duration between begin and end must be at least the time limit of the test");
      return;
    }

    onCreateTest({
      title,
      time,
      instructions,
      date,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Selected Questions Summary */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, color: "var(--color-navy)" }}>
            Selected Questions ({selectedQuestions.length})
          </h3>
          <span className="badge badge-success">Questions Confirmed</span>
        </div>

        <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {selectedQuestions.map((q, i) => (
            <div
              key={q.question + i}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                background: "var(--color-grey-bg)",
                border: "1px solid var(--color-grey-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px"
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-navy)" }}>
                {i + 1}. {q.question}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: "11px", textTransform: "uppercase" }}>
                {q.subject || q.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Details */}
      <div className="card" style={{ padding: "28px" }}>
        <h3 style={{ margin: "0 0 20px 0", color: "var(--color-navy)" }}>
          Assessment Scheduling & Parameters
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="form-group">
            <label className="form-label">Test Title *</label>
            <input
              type="text"
              placeholder="e.g., Campus Placement Aptitude Mock 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-grey-border)",
                fontSize: "14px",
                fontFamily: "var(--font-family)",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Time Limit (Minutes) *</label>
              <input
                type="number"
                placeholder="e.g., 30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-grey-border)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Test Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-grey-border)",
                  fontSize: "14px",
                  color: "var(--color-grey-text)",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Window Start Time *</label>
              <input
                type="time"
                value={beginTime}
                onChange={(e) => setBeginTime(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-grey-border)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Window End Time *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-grey-border)",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Candidate Instructions</label>
            <textarea
              placeholder="e.g., All questions carry equal marks. No negative marking. Do not refresh the page."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows="4"
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-grey-border)",
                fontSize: "14px",
                fontFamily: "var(--font-family)",
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "16px", borderTop: "1px solid var(--color-grey-border)" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
            >
              ← Back to Questions
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? "Publishing Test…" : "Publish Mock Assessment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}