import Navbar from "@/components/Navbar"
import { Routes, Route, useLocation } from "react-router-dom"
import Topbar from "@/components/Topbar"
import CodingLinksPage from "@/pages/practice/CodingLinksPage"

// Auth
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard"

// Resume
import ResumeAnalyzer from "./pages/resume/ResumeAnalyzer"
import CompanyAptitudeTable from "@/pages/practice/CompanyAptitudeTable"

// Practice Module
import PracticeHome from "./pages/practice/PracticeHome"
import CategoryPage from "./pages/practice/CategoryPage"
import QuestionTable from "./pages/practice/QuestionTable"
import QuestionPage from "./pages/practice/QuestionPage"
import CodingPage from "./pages/practice/CodingPage"
import CompanyList from "@/pages/practice/CompanyList"
import CompanyPage from "@/pages/practice/CompanyPage"

//Mock test
import MockTestHome from "./pages/mocktest/MockTestHome";
import CreateMock from "./pages/mocktest/CreateMock";
import PracticeTest from "./pages/mocktest/PracticeTest";
import TestPage from "./pages/mocktest/TestPage";
import MockList from "./pages/mocktest/MockList";

import "./styles/theme.css"

function App(){

const location = useLocation()

// Pages where navbar should NOT appear
const hideNavbarRoutes = ["/", "/signup"]

const showNavbar = !hideNavbarRoutes.includes(location.pathname)

return(

<div>

{/* Navbar only when logged pages */}
{showNavbar && <Navbar />}

<div
style={{
marginLeft: showNavbar ? "80px" : "0px",
padding:"20px"
}}
>
 {showNavbar && <Topbar />}

<Routes>

{/* Auth */}
<Route path="/" element={<Login />} />
<Route path="/signup" element={<Signup />} />

{/* Dashboard */}
<Route path="/dashboard" element={<Dashboard />} />

{/* Resume Analyzer */}
<Route path="/resume" element={<ResumeAnalyzer />} />

{/* Practice Hub */}
<Route path="/practice" element={<PracticeHome />} />

{/* Category Pages */}
<Route path="/practice/:category" element={<CategoryPage />} />

{/* Question Tables */}
<Route path="/practice/questions/:collectionName" element={<QuestionTable />} />

{/* Question Attempt Page */}
<Route path="/practice/question/:collectionName/:id" element={<QuestionPage />} />

{/* Coding Questions */}
<Route path="/practice/company" element={<CompanyList />} />
<Route path="/practice/company/:company" element={<CompanyPage />} />
<Route path="/practice/coding/:company" element={<CodingLinksPage />} />
<Route path="/practice/company/:company/aptitude" element={<CompanyAptitudeTable />} />

{/* Mock Test */}
<Route path="/mocktest" element={<MockTestHome />} />
<Route path="/create-mock" element={<CreateMock />} />
<Route path="/practice-test" element={<PracticeTest />} />
<Route path="/test" element={<TestPage />} />
<Route path="/mock-list" element={<MockList />} />

</Routes>

</div>

</div>

)

}

export default App