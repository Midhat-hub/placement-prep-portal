import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerEnded, setTimerEnded] = useState(false);
  const navigate = useNavigate();

  // LOAD QUESTIONS + SET TIME
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("mockQuestions"));
    const testData = JSON.parse(localStorage.getItem("currentTest"));

    setQuestions(data || []);

    // ✅ FINAL TIMER LOGIC
    let calculatedTime = 25 * 60; // default 25 minutes in seconds

    if (testData) {
      if (testData.time) {
        const testTimeInSeconds = testData.time * 60;

        // If test has start and end times (upcoming/previous mock)
        if (testData.start && testData.end) {
          const now = new Date().getTime();
          const endTime = new Date(testData.end).getTime();
          const isPrevious = now >= endTime;

          if (isPrevious) {
            // For previous mocks, use full test time
            calculatedTime = testTimeInSeconds;
          } else {
            // For upcoming mocks, use minimum of test time and available duration
            const startTime = new Date(testData.start).getTime();
            const durationInSeconds = (endTime - startTime) / 1000;
            calculatedTime = Math.min(testTimeInSeconds, durationInSeconds);
          }
        } else {
          // Practice test
          calculatedTime = testTimeInSeconds;
        }
      }
    }

    setTimeLeft(calculatedTime);
  }, []);

  // TIMER
  useEffect(() => {
    if (timeLeft <= 0 && timeLeft !== 0) {
      setTimerEnded(true);
      handleSubmit();
      return;
    }

    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // FORMAT TIME
  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // STORE ANSWERS
  const handleSelect = (qIndex, optionValue) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionValue,
    }));
  };

  // SUBMIT TEST
  const handleSubmit = () => {
    if (score !== null) return;

    let marks = 0;

    questions.forEach((q, i) => {
      const userAns = answers[i];
      const correctAns = q.answer;

      if (
        userAns &&
        correctAns &&
        userAns.toString().trim().toLowerCase() ===
          correctAns.toString().trim().toLowerCase()
      ) {
        marks++;
      }
    });

    setScore(marks);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mock Test</h2>

      {/* TIMER */}
      <h3 style={{ color: "red" }}>
        Time Left: {formatTime()}
      </h3>

      {/* QUESTIONS */}
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: "20px" }}>
          <p><b>{i + 1}. {q.question}</b></p>

          {q.options &&
            q.options.map((opt, index) => (
              <div key={index}>
                <input
                  type="radio"
                  name={`q-${i}`}
                  onChange={() => handleSelect(i, opt)}
                />
                {opt}
              </div>
            ))}
        </div>
      ))}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        style={{ padding: "10px 20px", marginTop: "20px" }}
      >
        Submit Test
      </button>

      {/* RESULT */}
      {score !== null && (
        <div>
          <h3>
            Your Score: {score} / {questions.length}
          </h3>
          {timerEnded && (
            <div style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
              zIndex: 1000,
              textAlign: "center",
              minWidth: "300px"
            }}>
              <h2 style={{ color: "#ff6b6b", marginBottom: "20px" }}>⏰ Time Over!</h2>
              <p style={{ marginBottom: "20px" }}>Your test has been submitted.</p>
              <button
                onClick={() => navigate("/mocktest")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}