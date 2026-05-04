import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MockList() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("mockTests")) || [];
    const now = new Date();
    const previous = data.filter((t) => t.end && new Date(t.end) <= now);
    setTests(previous);
  }, []);

  const startTest = (test) => {
  localStorage.setItem("mockQuestions", JSON.stringify(test.questions));
  localStorage.setItem("currentTest", JSON.stringify(test)); // 🔥 important
  navigate("/test");
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Mock Tests</h2>

      {tests.length === 0 && <p>No tests available</p>}

      {tests.map((test, i) => (
        <div
          key={test.id}
          style={{
            padding: "15px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "10px"
          }}
        >
          <h3>{test.title}</h3>
          <p>Questions: {test.questions.length}</p>

          <p><b>Time:</b> {test.time} minutes</p>
          <p><b>Instructions:</b> {test.instructions}</p>

          <button
            onClick={() => startTest(test)}
            style={{ padding: "8px 15px", cursor: "pointer" }}
          >
            Start Test
          </button>
        </div>
      ))}
    </div>
  );
}