import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PracticeTestPage() {

  const navigate = useNavigate();

  const [questions, setQuestions] =
    useState([]);

  const [test, setTest] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [score, setScore] =
    useState(null);

  const [timeLeft, setTimeLeft] =
    useState(0);

  useEffect(() => {

    const storedQuestions =
      JSON.parse(
        localStorage.getItem(
          "mockQuestions"
        )
      ) || [];

    const storedTest =
      JSON.parse(
        localStorage.getItem(
          "currentTest"
        )
      );

    if (
      !storedQuestions.length
    ) {

      navigate(
        "/practice-test"
      );

      return;

    }

    setQuestions(
      storedQuestions
    );

    setTest(
      storedTest
    );

    setTimeLeft(
      (storedTest?.time || 10)
      * 60
    );

  }, []);

  useEffect(() => {

    if (
      score !== null
    )
      return;

    if (
      timeLeft <= 0
    ) {

      submitTest();

      return;

    }

    const timer =
      setInterval(() => {

        setTimeLeft(
          (prev) =>
            prev - 1
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [timeLeft, score]);

  const formatTime =
    () => {

      const mins =
        Math.floor(
          timeLeft / 60
        );

      const secs =
        timeLeft % 60;

      return `${mins}:${
        secs < 10
          ? "0"
          : ""
      }${secs}`;

    };

  const selectAnswer =
    (
      questionIndex,
      option
    ) => {

      setAnswers(
        (prev) => ({

          ...prev,

          [questionIndex]:
            option

        })
      );

    };

  const submitTest =
    () => {

      let marks = 0;

      questions.forEach(
        (
          q,
          index
        ) => {

          if (
            answers[index] ===
            q.answer
          ) {

            marks++;

          }

        }
      );

      setScore(
        marks
      );

    };

  if (!test) {

    return (
      <h2>
        Loading...
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
        {test.title}
      </h1>

      {score === null && (

        <h3
          style={{
            color: "red"
          }}
        >
          Time Left:
          {" "}
          {formatTime()}
        </h3>

      )}

      <hr />

      {score === null ? (

        <>

          {questions.map(
            (
              q,
              index
            ) => (

              <div
                key={index}
                style={{
                  marginBottom:
                    "30px"
                }}
              >

                <h4>
                  {index + 1}.
                  {" "}
                  {q.question}
                </h4>

                {q.options?.map(
                  (
                    option,
                    optionIndex
                  ) => (

                    <label
                      key={
                        optionIndex
                      }
                      style={{
                        display:
                          "block",
                        margin:
                          "8px 0"
                      }}
                    >

                      <input
                        type="radio"
                        name={`q${index}`}
                        checked={
                          answers[
                            index
                          ] ===
                          option
                        }
                        onChange={() =>
                          selectAnswer(
                            index,
                            option
                          )
                        }
                      />

                      {" "}
                      {option}

                    </label>

                  )
                )}

              </div>

            )
          )}

          <button
            onClick={
              submitTest
            }
            style={{
              padding:
                "10px 20px"
            }}
          >
            Submit Test
          </button>

        </>

      ) : (

        <>

          <h2>
            Score:
            {" "}
            {score}
            {" / "}
            {
              questions.length
            }
          </h2>

          <h3>
            Percentage:
            {" "}
            {
              Math.round(
                (
                  score /
                  questions.length
                ) * 100
              )
            }
            %
          </h3>

          <hr />

          {questions.map(
            (
              q,
              index
            ) => {

              const userAnswer =
                answers[
                  index
                ];

              const correct =
                userAnswer ===
                q.answer;

              return (

                <div
                  key={index}
                  style={{
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    padding:
                      "15px",
                    marginBottom:
                      "20px"
                  }}
                >

                  <h4>
                    Q
                    {index + 1}
                    .
                    {" "}
                    {q.question}
                  </h4>

                  <p>

                    <strong>
                      Your Answer:
                    </strong>

                    {" "}

                    {
                      userAnswer ||
                      "Not Answered"
                    }

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

                    {
                      correct
                        ? "✓ Correct"
                        : "✗ Incorrect"
                    }

                  </p>

                </div>

              );

            }
          )}

          <button
            onClick={() =>
              navigate(
                "/practice-test"
              )
            }
            style={{
              padding:
                "10px 20px"
            }}
          >
            Back To Practice Tests
          </button>

        </>

      )}

    </div>

  );

}