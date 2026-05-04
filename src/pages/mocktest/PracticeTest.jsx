import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import core from "../../../datasets/core_questions.json";
import dsa from "../../../datasets/dsa_questions.json";
import aptitude from "../../../datasets/general_aptitude.json";

export default function PracticeTest() {
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    // Combine all questions
    let allQuestions = [...core, ...dsa, ...aptitude];

    // Shuffle questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());

    // Pick 25 questions
    const selected = shuffled.slice(0, 25);


    // ❗ CLEAR ADMIN TEST DATA
    localStorage.removeItem("currentTest");

// Store questions
    localStorage.setItem("mockQuestions", JSON.stringify(selected));  
    // Navigate to test page
    navigate("/test");
  };

  return <h2>Loading Practice Test...</h2>;
}