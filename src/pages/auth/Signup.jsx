import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
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
            <h1>Join PrepPortal</h1>
            <h3>Start your structured placement journey today</h3>
            <p>Access hundreds of curated placement resources, company questions, and test your interview readiness.</p>

            <div className="login-feature-list">
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>Full access to all mock test series</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>AI resume feedback and ATS score</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>Targeted company-specific prep</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Sign up to unlock all placement preparation resources</p>

          {error && (
            <div className="login-error" role="alert" style={{ marginBottom: "16px" }}>
              <AlertTriangleIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <p className="signup-text">
            Already have an account?
            <button
              className="signup-btn"
              onClick={() => navigate("/")}
              type="button"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;