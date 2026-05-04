import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PreviousMocks() {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to the mock list page which contains previous mocks
    navigate("/mock-list");
  }, [navigate]);

  return null;
}
