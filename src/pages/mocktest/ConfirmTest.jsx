import { useState } from "react";

export default function ConfirmTest({
  selectedQuestions,
  onBack,
  onCreateTest,
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
      alert("Invalid Begin time");
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
    <div style={{ padding: "20px" }}>
      <h2>Step 2: Confirm & Add Details</h2>

      {/* Selected Questions Review */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <h3>Selected Questions ({selectedQuestions.length})</h3>
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {selectedQuestions.map((q, i) => (
            <div
              key={q.question + i}
              style={{
                marginBottom: "10px",
                padding: "8px",
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
              }}
            >
              <b>{i + 1}. {q.question}</b>
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                ({q.subject})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Details */}
      <h3>Test Details</h3>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <b>Test Title:</b>
        </label>
        <br />
        <input
          type="text"
          placeholder="Enter test title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            marginTop: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <b>Time Limit (minutes):</b>
        </label>
        <br />
        <input
          type="number"
          placeholder="Enter time limit"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "200px",
            marginTop: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label>
          <b>Instructions:</b>
        </label>
        <br />
        <textarea
          placeholder="Enter test instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows="5"
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "500px",
            marginTop: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label><b>Test Date:</b></label>
        <br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "10px", width: "200px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <div>
          <label><b>Begin Time:</b></label>
          <br />
          <input
            type="time"
            value={beginTime}
            onChange={(e) => setBeginTime(e.target.value)}
            style={{ padding: "10px", width: "160px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        <div>
          <label><b>End Time:</b></label>
          <br />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ padding: "10px", width: "160px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onBack}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#757575",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleCreate}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        >
          Create Test
        </button>
      </div>
    </div>
  );
}