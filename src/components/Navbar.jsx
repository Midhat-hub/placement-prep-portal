import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { auth } from "@/firebase/firebase"
import { signOut } from "firebase/auth"
import {
  HomeIcon,
  BookOpenIcon,
  FileTextIcon,
  FileCheckIcon,
  BotIcon,
  MicIcon,
  LogOutIcon
} from "./Icons"

function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(path) {
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div
      className="sidebar"
      style={{ width: open ? "220px" : "70px" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* ── BRAND ─────────────────────────────── */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">P</div>
        {open && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">PrepPortal</span>
            <span className="sidebar-brand-sub">UMIT Placement</span>
          </div>
        )}
      </div>

      {/* ── MAIN NAV ──────────────────────────── */}
      <div className="nav-section">
        {open && <span className="nav-group-label">Main</span>}

        <button
          className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
          aria-label="Dashboard"
        >
          <span className="icon"><HomeIcon size={19} /></span>
          {open && <span>Dashboard</span>}
        </button>

        {open && <span className="nav-group-label">Practice</span>}

        <button
          className={`nav-item ${isActive("/practice") ? "active" : ""}`}
          onClick={() => navigate("/practice")}
          aria-label="Practice"
        >
          <span className="icon"><BookOpenIcon size={19} /></span>
          {open && <span>Practice</span>}
        </button>

        <button
          className={`nav-item ${isActive("/mocktest") ? "active" : ""}`}
          onClick={() => navigate("/mocktest")}
          aria-label="Mock Tests"
        >
          <span className="icon"><FileTextIcon size={19} /></span>
          {open && <span>Mock Tests</span>}
        </button>

        {open && <span className="nav-group-label">Tools</span>}

        <button
          className={`nav-item ${isActive("/resume") ? "active" : ""}`}
          onClick={() => navigate("/resume")}
          aria-label="Resume Analyzer"
        >
          <span className="icon"><FileCheckIcon size={19} /></span>
          {open && <span>Resume</span>}
        </button>

        <button
          className={`nav-item ${isActive("/chatbot") ? "active" : ""}`}
          onClick={() => navigate("/chatbot")}
          aria-label="AI Assistant"
        >
          <span className="icon"><BotIcon size={19} /></span>
          {open && <span>AI Assistant</span>}
        </button>

        <button
          className={`nav-item ${isActive("/voice-interview") ? "active" : ""}`}
          onClick={() => navigate("/voice-interview")}
          aria-label="Voice Interview"
        >
          <span className="icon"><MicIcon size={19} /></span>
          {open && <span>Voice Interview</span>}
        </button>
      </div>

      {/* ── BOTTOM ─────────────────────────────── */}
      <div className="nav-bottom">
        <button
          className="nav-item"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <span className="icon"><LogOutIcon size={19} /></span>
          {open && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}

export default Navbar