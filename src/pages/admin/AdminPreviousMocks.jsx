import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

export default function AdminPreviousMocks() {

  const [mocks, setMocks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  useEffect(() => {

    loadMocks();

  }, []);

  const loadMocks =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "mockTests"
            )
          );

        const now =
          new Date();

        const previous = [];

        snapshot.forEach(
          (mockDoc) => {

            const data =
              mockDoc.data();

            const end =
              data.endTime?.toDate();

            if (
              end &&
              now > end
            ) {

              previous.push({

                id:
                  mockDoc.id,

                ...data

              });

            }

          }
        );

        previous.sort(
          (a, b) =>
            b.endTime.seconds -
            a.endTime.seconds
        );

        setMocks(previous);

      }
      catch (error) {

        console.error(error);

      }

      setLoading(false);

    };

  if (loading) {

    return (
      <h2>
        Loading...
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
        Previous Mocks
      </h1>

      {
        mocks.length === 0 &&
        (
          <p>
            No completed mocks.
          </p>
        )
      }

      {
        mocks.map(
          (mock) => (

            <div
              key={mock.id}
              style={{
                background:
                  "#fff",

                padding:
                  "20px",

                marginBottom:
                  "20px",

                borderRadius:
                  "12px",

                boxShadow:
                  "0 2px 8px rgba(0,0,0,.08)"
              }}
            >

              <h3>
                {mock.title}
              </h3>

              <p>
                Questions:
                {" "}
                {
                  mock.questionCount
                }
              </p>

              <p>
                Ended:
                {" "}
                {
                  mock.endTime
                    ?.toDate()
                    .toLocaleString()
                }
              </p>

              <button
                onClick={() =>
                  navigate(
                    `/mock-review/${mock.id}`
                  )
                }
              >
                Review Questions
              </button>

            </div>

          )
        )
      }

    </div>

  );

}