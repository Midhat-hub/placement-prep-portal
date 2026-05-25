import { useState } from "react";
import { useNavigate } from "react-router-dom";




import { db } from "@/firebase/firebase";

import {
  addDoc,
  collection,
  Timestamp
} from "firebase/firestore";

export default function CreateMock() {

  const [step, setStep] = useState(1);

  const [selectedQuestions, setSelectedQuestions] =
    useState([]);

  const navigate = useNavigate();

  // STEP 1 → STEP 2
  const handleNext = (questions) => {

    setSelectedQuestions(questions);

    setStep(2);

  };

  // BACK BUTTON
  const handleBack = () => {

    setStep(1);

  };

  // CREATE MOCK TEST
  const handleCreateTest = async (details) => {

    try {

      await addDoc(
        collection(db, "mockTests"),
        {
          title: details.title,

          instructions:
            details.instructions || "",

          duration:
            Number(details.time),

          startTime:
            Timestamp.fromDate(
              new Date(details.startISO)
            ),

          endTime:
            Timestamp.fromDate(
              new Date(details.endISO)
            ),

          status: "upcoming",

          questionCount:
            selectedQuestions.length,

          questions:
            selectedQuestions,

          createdAt:
            Timestamp.now()
        }
      );

      alert(
        "Mock Test Created Successfully!"
      );

      navigate("/admin/dashboard");

    }
    catch (error) {

      console.error(error);

      alert(
        "Error creating mock test"
      );

    }

  };

  return (

    <div>

      {step === 1 && (
        <SelectQuestions
          onNext={handleNext}
        />
      )}

      {step === 2 && (
        <ConfirmTest
          selectedQuestions={
            selectedQuestions
          }
          onBack={handleBack}
          onCreateTest={
            handleCreateTest
          }
        />
      )}

    </div>

  );

}