import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";
export default function TestPage() {

  const { mockId } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [mock, setMock] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState({});

  const [score, setScore] =
    useState(null);

  const [timeLeft, setTimeLeft] =
    useState(0);

  // LOAD MOCK

  useEffect(() => {

    const loadMock =
      async () => {

      try {

        const snap =
          await getDoc(
            doc(
              db,
              "mockTests",
              mockId
            )
          );

        if (!snap.exists()) {

          alert(
            "Mock not found"
          );

          navigate("/mocktest");

          return;

        }

        const data =
          snap.data();

        setMock(data);

        setQuestions(
          data.questions || []
        );

        setTimeLeft(
          (data.duration || 30) * 60
        );

      }
      catch (error) {

        console.error(error);

        alert(
          "Failed to load test"
        );

      }

      setLoading(false);

    };

    loadMock();

  }, [mockId]);

  // TIMER

  useEffect(() => {

    if (
      loading ||
      score !== null
    )
      return;

    if (timeLeft <= 0) {

      submitTest();

      return;

    }

    const timer =
      setInterval(() => {

        setTimeLeft(
          (prev) => prev - 1
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [
    timeLeft,
    loading,
    score
  ]);

  // FORMAT TIME

  const formatTime = () => {

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

  // SELECT ANSWER

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

  // SUBMIT

const submitTest = async () => {

  let marks = 0;

  questions.forEach((q, index) => {

    const userAnswer =
      answers[index];

    if (
      userAnswer === q.answer
    ) {
      marks++;
    }

  });

  try {

    const user =
      auth.currentUser;

    if (user) {

      await setDoc(

        doc(
          db,
          "user_progress",
          user.uid,
          "mock_tests",
          mockId
        ),

        {
          mockId,

          title:
            mock.title,

          score:
            marks,

          totalQuestions:
            questions.length,

          percentage:
            Math.round(
              (
                marks /
                questions.length
              ) * 100
            ),

          answers,

          submittedAt:
            Timestamp.now()
        }

      );

    }

    setScore(marks);

  }
  catch (error) {

    console.error(error);

    alert(
      "Failed to save result"
    );

  }

};

  if (loading) {

    return (
      <h2>
        Loading Test...
      </h2>
    );

  }

  return (

    <div
      style={{
        padding: "20px"
      }}
    >

      <h1>
        {mock?.title}
      </h1>

      <h3
        style={{
          color: "red"
        }}
      >
        Time Left:
        {" "}
        {formatTime()}
      </h3>

      <hr />

      {questions.map(
        (q, index) => (

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

      {score === null ? (

        <button
          onClick={
            submitTest
          }
        >
          Submit Test
        </button>

      ) : (

        <div>

          <h2>
            Score:
            {" "}
            {score}
            {" / "}
            {
              questions.length
            }
          </h2>

          <button
            onClick={() =>
              navigate(
                "/mocktest"
              )
            }
          >
            Back
          </button>

        </div>

      )}

    </div>

  );

}