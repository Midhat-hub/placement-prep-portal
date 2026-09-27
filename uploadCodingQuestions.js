import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyDAkkQUxg_xyNNiLm5nhnX2m4iuYJ08xwQ",
  authDomain: "placement-prep-portal-7d3ef.firebaseapp.com",
  projectId: "placement-prep-portal-7d3ef",
  storageBucket: "placement-prep-portal-7d3ef.firebasestorage.app",
  messagingSenderId: "897705345889",
  appId: "1:897705345889:web:921dc07eff45a825397b20"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadCodingQuestions() {

  const filePath = "./datasets/coding_questions.json";

  const data = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  console.log(`Found ${data.length} coding questions.`);

  for (const item of data) {

    await setDoc(
      doc(db, "coding_questions", item.id),
      item
    );

    console.log(`Uploaded: ${item.id}`);
  }

  console.log("✅ Coding questions uploaded successfully!");
}

uploadCodingQuestions();