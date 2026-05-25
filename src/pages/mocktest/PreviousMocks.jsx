import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";

export default function PreviousMocks() {

  const [mocks, setMocks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    const loadMocks = async () => {

      try {

        const now = new Date();

        const snapshot =
          await getDocs(
            collection(
              db,
              "mockTests"
            )
          );

        const mockList = [];

        for (const mockDoc of snapshot.docs) {

          const mockData =
            mockDoc.data();

          const endTime =
            mockData.endTime?.toDate();

          // only completed mocks
          if (
            endTime &&
            now > endTime
          ) {

            let attemptData =
              null;

            const user =
              auth.currentUser;

            if (user) {

              const attemptRef =
                doc(
                  db,
                  "user_progress",
                  user.uid,
                  "mock_tests",
                  mockDoc.id
                );

              const attemptSnap =
                await getDoc(
                  attemptRef
                );

              if (
                attemptSnap.exists()
              ) {

                attemptData =
                  attemptSnap.data();

              }

            }

            mockList.push({

              id:
                mockDoc.id,

              ...mockData,

              attempt:
                attemptData

            });

          }

        }

        setMocks(mockList);

      }
      catch (error) {

        console.error(error);

      }

      setLoading(false);

    };

    loadMocks();

  }, []);

  if (loading) {

    return (
      <h2>
        Loading Previous Mocks...
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
        Previous Mock Tests
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
        mocks.map((mock) => (

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
                "0 2px 8px rgba(0,0,0,0.08)"
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

            {
              mock.attempt ? (

                <>

                  <p
                    style={{
                      color:
                        "green"
                    }}
                  >
                    ✓ Attempted
                  </p>

                  <p>
                    Score:
                    {" "}
                    {
                      mock.attempt.score
                    }
                    {" / "}
                    {
                      mock.attempt.totalQuestions
                    }
                  </p>

                </>

              ) : (

                <p
                  style={{
                    color:
                      "#ff9800"
                  }}
                >
                  Not Attempted
                </p>

              )
            }

            <button
              onClick={() =>
                navigate(
                  `/mock-review/${mock.id}`
                )
              }
            >
              Review
            </button>

          </div>

        ))
      }

    </div>

  );

}