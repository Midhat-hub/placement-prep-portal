import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

export default function UpcomingMocksAdmin() {

  const [mocks, setMocks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

        const upcoming = [];

        snapshot.forEach(
          (mockDoc) => {

            const data =
              mockDoc.data();

            const start =
              data.startTime?.toDate();

            if (
              start &&
              now < start
            ) {

              upcoming.push({

                id:
                  mockDoc.id,

                ...data

              });

            }

          }
        );

        upcoming.sort(
          (a, b) =>
            a.startTime.seconds -
            b.startTime.seconds
        );

        setMocks(upcoming);

      }
      catch (error) {

        console.error(error);

      }

      setLoading(false);

    };

  const deleteMock =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this mock?"
        );

      if (
        !confirmDelete
      )
        return;

      try {

        await deleteDoc(
          doc(
            db,
            "mockTests",
            id
          )
        );

        loadMocks();

      }
      catch (error) {

        console.error(error);

      }

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
        Upcoming Mocks
      </h1>

      {
        mocks.length === 0 &&
        (
          <p>
            No upcoming mocks.
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
                Starts:
                {" "}
                {
                  mock.startTime
                    ?.toDate()
                    .toLocaleString()
                }
              </p>

              <p>
                Ends:
                {" "}
                {
                  mock.endTime
                    ?.toDate()
                    .toLocaleString()
                }
              </p>

              <button
                onClick={() =>
                  deleteMock(
                    mock.id
                  )
                }
                style={{
                  background:
                    "#d32f2f",

                  color:
                    "white",

                  border:
                    "none",

                  padding:
                    "10px 15px",

                  borderRadius:
                    "6px",

                  cursor:
                    "pointer"
                }}
              >
                Delete Mock
              </button>

            </div>

          )
        )
      }

    </div>

  );

}