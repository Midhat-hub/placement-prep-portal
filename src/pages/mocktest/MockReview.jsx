import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "@/firebase/firebase";

export default function MockReview() {

  const { mockId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadReview = async () => {

      try {

        // Load mock
        const mockSnap = await getDoc(
          doc(
            db,
            "mockTests",
            mockId
          )
        );

        if (!mockSnap.exists()) {
          alert("Mock not found");
          return;
        }

        const mockData =
          mockSnap.data();

        setQuestions(
          mockData.questions || []
        );

        // Load user attempt
        const user =
          auth.currentUser;

        if (user) {

          const attemptSnap =
            await getDoc(
              doc(
                db,
                "user_progress",
                user.uid,
                "mock_tests",
                mockId
              )
            );

          if (
            attemptSnap.exists()
          ) {

            setAttempt(
              attemptSnap.data()
            );

          }

        }

      }
      catch (error) {

        console.error(error);

      }

      setLoading(false);

    };

    loadReview();

  }, [mockId]);

  if (loading) {

    return (
      <h2>
        Loading Review...
      </h2>
    );

  }

  return (

    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto"
      }}
    >

      <h1>
        Mock Review
      </h1>

      {attempt && (

        <div
          style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}
        >

          <h3>
            Score:
            {" "}
            {attempt.score}
            {" / "}
            {attempt.totalQuestions}
          </h3>

          <p>
            Percentage:
            {" "}
            {attempt.percentage}%
          </p>

        </div>

      )}

      {questions.map(
        (q, index) => {

          const userAnswer =
            attempt?.answers?.[
              index
            ];

          const correct =
            userAnswer ===
            q.answer;

          return (

            <div
              key={index}
              style={{
                background:
                  "#fff",

                padding:
                  "20px",

                marginBottom:
                  "20px",

                borderRadius:
                  "10px",

                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)"
              }}
            >

              <h3>
                Q{index + 1}.
                {" "}
                {q.question}
              </h3>

              <div
                style={{
                  marginTop:
                    "15px"
                }}
              >

                <p>

                  <strong>
                    Your Answer:
                  </strong>

                  {" "}

                  {userAnswer ||
                    "Not Answered"}

                </p>

                <p>

                  <strong>
                    Correct Answer:
                  </strong>

                  {" "}

                  {q.answer}

                </p>

                <p
                  style={{
                    color:
                      correct
                        ? "green"
                        : "red",

                    fontWeight:
                      "bold"
                  }}
                >

                  {correct
                    ? "✓ Correct"
                    : "✗ Incorrect"}

                </p>

              </div>

            </div>

          );

        }
      )}

    </div>

  );

}