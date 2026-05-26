import { useMemo, useState } from "react";

import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";

export default function QuestionBank() {

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [difficulty, setDifficulty] =
    useState("all");

  const questions =
    useMemo(() => {

      const all = [

        ...core.map(q => ({
          ...q,
          category: "core"
        })),

        ...dsa.map(q => ({
          ...q,
          category: "dsa"
        })),

        ...aptitude.map(q => ({
          ...q,
          category: "aptitude"
        }))

      ];

      return all.filter(q => {

        const matchesSearch =
          q.question
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesCategory =
          category === "all" ||
          q.category === category;

        const matchesDifficulty =
          difficulty === "all" ||
          q.difficulty === difficulty;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesDifficulty
        );

      });

    }, [
      search,
      category,
      difficulty
    ]);

  return (

    <div
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Question Bank
      </h1>

      {/* Filters */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
          flexWrap: "wrap"
        }}
      >

        <input
          type="text"
          placeholder="Search question..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            padding: "10px",
            width: "300px"
          }}
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
        >

          <option value="all">
            All Categories
          </option>

          <option value="core">
            Core
          </option>

          <option value="dsa">
            DSA
          </option>

          <option value="aptitude">
            Aptitude
          </option>

        </select>

        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(
              e.target.value
            )
          }
        >

          <option value="all">
            All Difficulty
          </option>

          <option value="easy">
            Easy
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="hard">
            Hard
          </option>

        </select>

      </div>

      <p>
        Total Questions:
        {" "}
        {questions.length}
      </p>

      {questions.map(
        (q, index) => (

          <details
            key={index}
            style={{
              background: "#fff",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,.08)"
            }}
          >

            <summary
              style={{
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {q.question}
            </summary>

            <div
              style={{
                marginTop: "10px"
              }}
            >

              <p>
                Category:
                {" "}
                {q.category}
              </p>

              <p>
                Difficulty:
                {" "}
                {q.difficulty}
              </p>

              {q.options?.map(
                (
                  option,
                  i
                ) => (

                  <p key={i}>
                    {option}
                  </p>

                )
              )}

              <p
                style={{
                  color:
                    "green",
                  fontWeight:
                    "bold"
                }}
              >
                Answer:
                {" "}
                {q.answer}
              </p>

            </div>

          </details>

        )
      )}

    </div>

  );

}