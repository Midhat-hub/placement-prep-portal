import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const adminEmails = [
        "admin@placementportal.com"
      ];

      if (
        !adminEmails.includes(
          userCredential.user.email
        )
      ) {
        alert("Access denied. Not an admin account.");
        return;
      }

      navigate("/admin/dashboard");

    } catch (error) {

      alert(error.message);

    }

  };

  return (

    <div className="login-page">

      <div className="login-card">

        {/* LEFT PANEL */}

        <div className="login-left">

          <div className="login-left-content">

            <h1>Welcome Admin!</h1>

            <h3>
              Manage mock tests, questions and student activity.
            </h3>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="login-right">

          <h2 className="login-title">
            Admin Login
          </h2>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button type="submit">
              Login
            </button>

          </form>

        </div>

      </div>

    </div>

  );

}

export default AdminLogin;