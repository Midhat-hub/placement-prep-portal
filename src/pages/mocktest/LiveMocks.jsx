import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "@/firebase/firebase";

export default function LiveMocks() {

  const [tests, setTests] =
    useState([]);

  const navigate =
    useNavigate();

  useEffect(() => {

    const loadMocks =
      async () => {

      try {

        const snap =
          await getDocs(
            collection(
              db,
              "mockTests"
            )
          );

        const now =
          new Date();

        const live = [];

        snap.forEach((mockDoc) => {

          const data =
            mockDoc.data();

          const start =
            data.startTime?.toDate();

          const end =
            data.endTime?.toDate();

          if (
            start &&
            end &&
            now >= start &&
            now <= end
          ) {

            live.push({
              id: mockDoc.id,
              ...data
            });

          }

        });

        setTests(live);

      }
      catch (error) {

        console.error(error);

      }

    };

    loadMocks();

    // Refresh every 30 sec
    const interval =
      setInterval(
        loadMocks,
        30000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  const startTest =
    async (test) => {

      try {

        const user =
          auth.currentUser;

        if (!user) {

          alert(
            "Please login first."
          );

          return;

        }

        const now =
          new Date();

        const end =
          test.endTime?.toDate();

        if (
          end &&
          now > end
        ) {

          alert(
            "This mock has ended."
          );

          return;

        }

        const attemptRef =
          doc(
            db,
            "user_progress",
            user.uid,
            "mock_tests",
            test.id
          );

        const attemptSnap =
          await getDoc(
            attemptRef
          );

        if (
          attemptSnap.exists()
        ) {

          alert(
            "You have already attempted this mock."
          );

          return;

        }

        navigate(
          `/test/${test.id}`
        );

      }
      catch (error) {

        console.error(error);

      }

    };

  return (

    <div
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Live Mock Tests
      </h1>

      {
        tests.length === 0 && (

          <p>
            No live mocks.
          </p>

        )
      }

      {
        tests.map((test) => (

          <div
            key={test.id}
            style={{
              background: "#fff",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "12px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,.08)"
            }}
          >

            <h3>
              {test.title}
            </h3>

            <p>
              Questions:
              {" "}
              {test.questionCount}
            </p>

            <p>
              Duration:
              {" "}
              {test.duration}
              {" "}
              min
            </p>

            <button
              onClick={() =>
                startTest(test)
              }
              style={{
                padding:
                  "10px 16px",
                background:
                  "#003b63",
                color:
                  "white",
                border:
                  "none",
                borderRadius:
                  "6px",
                cursor:
                  "pointer"
              }}
            >
              Start Test
            </button>

          </div>

        ))
      }

    </div>

  );

}