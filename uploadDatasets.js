import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";

// YOUR FIREBASE CONFIG (same as firebase.js)
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

async function uploadDataset(filePath, collectionPath) {

  const data = JSON.parse(fs.readFileSync(filePath));

  for (const item of data) {
    await addDoc(collection(db, collectionPath), item);
  }

  console.log(`Uploaded ${filePath}`);
}

async function run(){

  await uploadDataset("./datasets/dsa_questions.json", "questions/dsa/items");

  await uploadDataset("./datasets/general_aptitude.json", "questions/aptitude/items");

  await uploadDataset("./datasets/core_questions.json", "questions/core_subjects/items");

  await uploadDataset("./datasets/company_aptitude_questions.json", "company_prep/company_aptitude/items");

  await uploadDataset("./datasets/deloitte_coding_links.json", "company_prep/deloitte/items");

}

run();