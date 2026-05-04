import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectQuestions from "./SelectQuestions";
import ConfirmTest from "./ConfirmTest";

export default function CreateMock() {
  const [step, setStep] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const navigate = useNavigate();

  const handleNext = (questions) => {
    setSelectedQuestions(questions);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCreateTest = (details) => {
    const newTest = {
      id: Date.now(),
      title: details.title,
      questions: selectedQuestions,
      time: details.time,
      instructions: details.instructions,
      start: details.startISO || null,
      end: details.endISO || null,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("mockTests")) || [];
    existing.push(newTest);
    localStorage.setItem("mockTests", JSON.stringify(existing));
    alert("Mock Test Created Successfully!");
    navigate("/mocktest");
  };

  return (
    <div>
      {step === 1 && <SelectQuestions onNext={handleNext} />}
      {step === 2 && (
        <ConfirmTest
          selectedQuestions={selectedQuestions}
          onBack={handleBack}
          onCreateTest={handleCreateTest}
        />
      )}
    </div>
  );
}