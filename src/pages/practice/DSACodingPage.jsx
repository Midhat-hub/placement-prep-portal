import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

function DSACodingPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const snapshot = await getDocs(collection(db, "coding_questions"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setQuestions(data);
      } catch (error) {
        console.error("Error loading coding questions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const categories = [
    "All",
    ...new Set(questions.map((q) => q.category).filter(Boolean)),
  ];

  const difficulties = [
    "All",
    ...new Set(questions.map((q) => q.difficulty).filter(Boolean)),
  ];

  const filteredQuestions = questions.filter((q) => {
    const categoryMatch =
      selectedCategory === "All" || q.category === selectedCategory;

    const difficultyMatch =
      selectedDifficulty === "All" || q.difficulty === selectedDifficulty;

    return categoryMatch && difficultyMatch;
  });

  if (loading) {
    return (
      <div className="page">
        <h2 className="page-heading">DSA Coding</h2>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-heading">DSA Coding</h2>

      <div className="card">
        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Topics" : category}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty === "All" ? "All Difficulties" : difficulty}
              </option>
            ))}
          </select>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            {filteredQuestions.length} questions
          </div>
        </div>

        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Problem</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredQuestions.map((q, i) => (
              <tr key={q.id}>
                <td>{i + 1}</td>

                <td className="question-col">{q.title}</td>

                <td>{q.category || "-"}</td>

                <td>{q.difficulty || "-"}</td>

                <td>
                  <button
                    className="solve-btn"
                    onClick={() => navigate(`/practice/dsa-coding/${q.id}`)}
                  >
                    Solve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredQuestions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              color: "#64748b",
            }}
          >
            No questions found.
          </div>
        )}
      </div>
    </div>
  );
}

export default DSACodingPage;
