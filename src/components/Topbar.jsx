import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { auth } from "@/firebase/firebase"
import { onAuthStateChanged } from "firebase/auth"

const PAGE_TITLES = {
  "/dashboard":         "Dashboard",
  "/practice":          "Practice Hub",
  "/resume":            "Resume Analyzer",
  "/chatbot":           "AI Assistant",
  "/voice-interview":   "Voice Interview",
  "/mocktest":          "Mock Tests",
  "/mocktest/live":     "Live Mocks",
  "/mocktest/upcoming": "Upcoming Mocks",
  "/mocktest/previous": "Previous Mocks",
  "/practice-test":     "Practice Test",
}

function getTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith("/practice/dsa-coding")) return "DSA Coding"
  if (pathname.startsWith("/practice/company"))     return "Company Practice"
  if (pathname.startsWith("/practice/questions"))   return "Questions"
  if (pathname.startsWith("/practice/question"))    return "Question"
  if (pathname.startsWith("/practice/coding"))      return "Coding Links"
  if (pathname.startsWith("/test/"))                return "Test"
  if (pathname.startsWith("/mock-review/"))         return "Mock Review"
  if (pathname.startsWith("/practice/"))            return "Practice"
  return "UMIT Placement Prep"
}

function getInitials(user) {
  if (!user) return "?"
  if (user.displayName) {
    return user.displayName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
  }
  return (user.email || "?")[0].toUpperCase()
}

function getDisplayName(user) {
  if (!user) return ""
  return user.displayName || user.email?.split("@")[0] || "Student"
}

function Topbar() {
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const title = getTitle(location.pathname)

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        {user && (
          <div className="topbar-user">
            <div
              className="topbar-user-avatar"
              aria-hidden="true"
            >
              {getInitials(user)}
            </div>
            <span className="topbar-user-name">
              {getDisplayName(user)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Topbar