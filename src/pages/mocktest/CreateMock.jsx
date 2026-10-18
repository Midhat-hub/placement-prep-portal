import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectQuestions from "./SelectQuestions";
import ConfirmTest from "./ConfirmTest";
import { db } from "@/firebase/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { FileTextIcon } from "@/components/Icons";

export default function CreateMock() {
  const [step, setStep] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // STEP 1 -> STEP 2
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
    setSubmitting(true);
    try {
      await addDoc(collection(db, "mockTests"), {
        title: details.title,
        instructions: details.instructions || "",
        duration: Number(details.time),
        startTime: Timestamp.fromDate(new Date(details.startISO)),
        endTime: Timestamp.fromDate(new Date(details.endISO)),
        status: "upcoming",
        questionCount: selectedQuestions.length,
        questions: selectedQuestions,
        createdAt: Timestamp.now(),
      });

      alert("Mock Test Created Successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error creating mock test. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-hero">
        <div className="admin-hero-icon">
          <FileTextIcon size={26} color="var(--color-white)" />
        </div>
        <div>
          <h1>Create & Schedule Mock Assessment</h1>
          <p>Curate questions, set test parameters, and publish assessments to students.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          <span className={`badge ${step === 1 ? "badge-info" : "badge-success"}`}>
            Step 1: Questions ({selectedQuestions.length})
          </span>
          <span className={`badge ${step === 2 ? "badge-info" : "badge-neutral"}`}>
            Step 2: Configuration
          </span>
        </div>
      </div>

      {step === 1 && <SelectQuestions onNext={handleNext} />}

      {step === 2 && (
        <ConfirmTest
          selectedQuestions={selectedQuestions}
          onBack={handleBack}
          onCreateTest={handleCreateTest}
          submitting={submitting}
        />
      )}
    </div>
  );
}