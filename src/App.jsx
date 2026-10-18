import Navbar from "@/components/Navbar";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "@/components/Topbar";
import CodingLinksPage from "@/pages/practice/CodingLinksPage";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";
//<Route
//path="/resume"
// element={<ResumeAnalyzer />}

// Chatbot
import Chatbot from "./pages/chatbot/Chatbot";

// Resume
import ResumeAnalyzer from "./pages/resume/ResumeAnalyzer";
import CompanyAptitudeTable from "@/pages/practice/CompanyAptitudeTable";

// Practice Module
import PracticeHome from "./pages/practice/PracticeHome";
import CategoryPage from "./pages/practice/CategoryPage";
import QuestionTable from "./pages/practice/QuestionTable";
import QuestionPage from "./pages/practice/QuestionPage";
import CodingPage from "./pages/practice/CodingPage";
import CompanyList from "@/pages/practice/CompanyList";
import CompanyPage from "@/pages/practice/CompanyPage";
import DSACodingPage from "./pages/practice/DSACodingPage";
import CodingIDEPage from "./pages/practice/CodingIDEPage";

//Mock test
import MockTestHome from "./pages/mocktest/MockTestHome";
import CreateMock from "./pages/mocktest/CreateMock";
import PracticeTest from "./pages/mocktest/PracticeTest";
import TestPage from "./pages/mocktest/TestPage";

import UpcomingMocks from "./pages/mocktest/UpcomingMocks";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import LiveMocks from "./pages/mocktest/LiveMocks";
import PreviousMocks from "./pages/mocktest/PreviousMocks";
import MockReview from "./pages/mocktest/MockReview";
import QuestionBank from "./pages/admin/QuestionBank";

import UpcomingMocksAdmin from "./pages/admin/UpcomingMocksAdmin";
import AdminPreviousMocks from "./pages/admin/AdminPreviousMocks";
import PracticeTestPage from "./pages/mocktest/PracticeTestPage";
import VoiceInterview from "./pages/interview/VoiceInterview";
import "./index.css";

function App() {
  const location = useLocation();

  // Pages where navbar should NOT appear
  const hideNavbarRoutes = [
    "/",
    "/signup",
    "/admin-login",
    "/admin/dashboard",
    "/question-bank",
    "/admin/upcoming-mocks",
    "/create-mock",
    "/admin/previous-mocks",
  ];

  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/mock-review");

  const showNavbar =
    !hideNavbarRoutes.includes(location.pathname) && !isAdminPage;

  return (
    <div>
      {/* Navbar only when logged pages */}
      {showNavbar && <Navbar />}

      <div
        style={{
          marginLeft: showNavbar ? "var(--sidebar-collapsed, 70px)" : "0px",
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
          background: "var(--color-grey-bg)",
        }}
      >
        {showNavbar && <Topbar />}

        <Routes>
          <Route path="/practice-test" element={<PracticeTest />} />

          <Route path="/practice-test-page" element={<PracticeTestPage />} />
          <Route
            path="/admin/previous-mocks"
            element={<AdminPreviousMocks />}
          />

          <Route
            path="/admin/upcoming-mocks"
            element={<UpcomingMocksAdmin />}
          />

          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/mock-review/:mockId" element={<MockReview />} />

          <Route path="/mocktest/live" element={<LiveMocks />} />

          <Route path="/mocktest/previous" element={<PreviousMocks />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/practice/dsa-coding" element={<DSACodingPage />} />

          <Route path="/practice/dsa-coding/:id" element={<CodingIDEPage />} />
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* AI Chatbot */}
          <Route path="/chatbot" element={<Chatbot />} />

          {/* Resume Analyzer */}
          <Route path="/resume" element={<ResumeAnalyzer />} />

          {/* Practice Hub */}
          <Route path="/practice" element={<PracticeHome />} />

          {/* Category Pages */}
          <Route path="/practice/:category" element={<CategoryPage />} />

          {/* Question Tables */}
          <Route
            path="/practice/questions/:collectionName"
            element={<QuestionTable />}
          />

          {/* Question Attempt Page */}
          <Route
            path="/practice/question/:collectionName/:id"
            element={<QuestionPage />}
          />
          {/* Voice Mock Interview */}
          <Route path="/voice-interview" element={<VoiceInterview />} />

          {/* Resume Analyzer */}
          <Route path="/resume" element={<ResumeAnalyzer />} />

          {/* Coding Questions */}
          <Route path="/practice/company" element={<CompanyList />} />
          <Route path="/practice/company/:company" element={<CompanyPage />} />
          <Route
            path="/practice/coding/:company"
            element={<CodingLinksPage />}
          />
          <Route
            path="/practice/company/:company/aptitude"
            element={<CompanyAptitudeTable />}
          />

          {/* Mock Test */}
          <Route path="/mocktest" element={<MockTestHome />} />
          <Route path="/create-mock" element={<CreateMock />} />
          <Route path="/mocktest/upcoming" element={<UpcomingMocks />} />
          <Route path="/practice-test" element={<PracticeTest />} />
          <Route path="/test/:mockId" element={<TestPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
