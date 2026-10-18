import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-brand-mark">P</div>
            <h1>PrepPortal</h1>
            <h3>Your comprehensive placement preparation companion</h3>
            <p>Master aptitude, practice DSA coding, analyze your resume, and conduct AI voice interviews in one unified platform.</p>

            <div className="login-feature-list">
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>AI Voice Mock Interviews</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>Real-Time Timed Mock Tests</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>Company-Specific Question Bank</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>AI-Powered Resume Analyzer</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <h2 className="login-title">Student Login</h2>
          <p className="login-subtitle">Enter your credentials to access your prep dashboard</p>

          {error && (
            <div className="login-error" role="alert" style={{ marginBottom: "16px" }}>
              <AlertTriangleIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="student-email">Email Address</label>
              <input
                id="student-email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="student-password">Password</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="student-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-grey-muted)",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px"
                  }}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="signup-text">
            Don't have an account?
            <button
              className="signup-btn"
              onClick={() => navigate("/signup")}
              type="button"
            >
              Create account
            </button>
          </p>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-grey-border)", textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--color-grey-muted)" }}>
              Faculty / Placement Officer?{" "}
              <button
                onClick={() => navigate("/admin-login")}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-blue)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Admin Login
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;