import { useState } from "react";
import { useNavigate } from "react-router-dom";

import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";

export default function PracticeTest() {

  const navigate = useNavigate();

  const [subject, setSubject] =
    useState("all");

  const [numQuestions, setNumQuestions] =
    useState(10);

  const [loading, setLoading] =
    useState(false);

  const loadQuestions = () => {

    setLoading(true);

    let questions = [];

    if (subject === "core") {

      questions = [...core];

    }
    else if (subject === "dsa") {

      questions = [...dsa];

    }
    else if (subject === "aptitude") {

      questions = [...aptitude];

    }
    else {

      questions = [
        ...core,
        ...dsa,
        ...aptitude
      ];

    }

    const shuffled =
      [...questions].sort(
        () => Math.random() - 0.5
      );

    const selected =
      shuffled.slice(
        0,
        Math.min(
          numQuestions,
          shuffled.length
        )
      );

    const timerMinutes =
      selected.length;

    const practiceTest = {

      id: Date.now(),

      title:
        `Practice Test - ${subject.toUpperCase()}`,

      time:
        timerMinutes,

      isPractice:
        true

    };

    localStorage.setItem(
      "mockQuestions",
      JSON.stringify(selected)
    );

    localStorage.setItem(
      "currentTest",
      JSON.stringify(practiceTest)
    );

 navigate("/practice-test-page");

  };

  return (

    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto"
      }}
    >

      <h2>
        Practice Test
      </h2>

      <div
        style={{
          marginBottom: "20px"
        }}
      >

        <h4>
          Subject
        </h4>

        <label>
          <input
            type="radio"
            value="core"
            checked={
              subject === "core"
            }
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
          />
          Core Subjects
        </label>

        <br />

        <label>
          <input
            type="radio"
            value="dsa"
            checked={
              subject === "dsa"
            }
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
          />
          DSA
        </label>

        <br />

        <label>
          <input
            type="radio"
            value="aptitude"
            checked={
              subject === "aptitude"
            }
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
          />
          Aptitude
        </label>

        <br />

        <label>
          <input
            type="radio"
            value="all"
            checked={
              subject === "all"
            }
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
          />
          Mixed
        </label>

      </div>

      <div
        style={{
          marginBottom: "20px"
        }}
      >

        <h4>
          Number of Questions
        </h4>

        <input
          type="number"
          min="1"
          max="100"
          value={numQuestions}
          onChange={(e) =>
            setNumQuestions(
              parseInt(
                e.target.value
              ) || 1
            )
          }
        />

      </div>

      <p>
        Duration:
        {" "}
        {numQuestions}
        {" "}
        Minutes
      </p>

      <button
        onClick={loadQuestions}
        disabled={loading}
      >
        {
          loading
            ? "Starting..."
            : "Start Practice Test"
        }
      </button>

    </div>

  );

}