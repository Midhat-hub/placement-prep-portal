import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ShieldIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

function AdminLogin() {
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const adminEmails = [
        "admin@placementportal.com",
      ];

      if (!adminEmails.includes(userCredential.user.email)) {
        setError("Access denied. This account does not have administrator privileges.");
        setLoading(false);
        return;
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Failed to log in as admin. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left" style={{ background: "linear-gradient(145deg, #021a24 0%, #052f3f 100%)" }}>
          <div className="login-left-content">
            <div className="login-brand-mark" style={{ borderColor: "rgba(24, 160, 214, 0.4)", color: "var(--color-blue-light)" }}>
              <ShieldIcon size={24} color="var(--color-blue-light)" />
            </div>
            <h1>Admin Portal</h1>
            <h3>Placement Management & Assessment Control</h3>
            <p>Access question repositories, schedule timed mock tests, and monitor student readiness metrics.</p>

            <div className="login-feature-list">
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>Question Bank Management</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>Create & Schedule Mock Tests</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-dot" />
                <span>Monitor Past Mock Performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="badge badge-info">Staff Access</span>
          </div>
          <h2 className="login-title">Administrator Login</h2>
          <p className="login-subtitle">Sign in with authorized administrator credentials</p>

          {error && (
            <div className="login-error" role="alert" style={{ marginBottom: "16px" }}>
              <AlertTriangleIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Admin Email</label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@placementportal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Password</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter administrator password"
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
              {loading ? "Authenticating…" : "Login to Admin Portal"}
            </button>
          </form>

          <p className="signup-text">
            Are you a student?
            <button
              className="signup-btn"
              onClick={() => navigate("/")}
              type="button"
            >
              Student Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;