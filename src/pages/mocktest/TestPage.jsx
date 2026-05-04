import { useEffect, useState } from "react";

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // LOAD QUESTIONS + SET TIME
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("mockQuestions"));
    const testData = JSON.parse(localStorage.getItem("currentTest"));

    setQuestions(data || []);

    // ✅ FINAL TIMER LOGIC
    if (testData && testData.time) {
      // Admin mock → use admin time
      setTimeLeft(testData.time * 60);
    } else {
      // Practice mock → default 25 minutes
      setTimeLeft(25 * 60);
    }
  }, []);

  // TIMER
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

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
        <h3>
          Your Score: {score} / {questions.length}
        </h3>
      )}
    </div>
  );
}