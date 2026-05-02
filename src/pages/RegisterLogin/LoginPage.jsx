import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthScreenShell } from "../../components/AuthScreenShell";
import { AuthFormField } from "../../components/AuthFormField";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="Calcutta Canvas Space"
      titleItalic="Welcome"
      title="back."
      description="Sign in to view your portfolio access, current project status, support updates, and account details."
      footer={
        <p className="auth-footer-text">
          Secure customer login · email and password.
        </p>
      }
    >
      <div className="auth-card-header">
        <h2 className="auth-card-title">Sign In</h2>
        <p className="auth-card-sub">
          Use the credentials you registered with.
        </p>
      </div>

      <AuthFormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />
      <AuthFormField
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <button
        className="btn btn--primary"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? <div className="spinner" /> : "Sign In"}
      </button>

      {error && <p className="msg msg--error">{error}</p>}

      <div className="meta-row">
        <Link to="/register" className="meta-link">
          Create account
        </Link>
        <Link to="/login" className="meta-link">
          Forgot password?
        </Link>
      </div>
    </AuthScreenShell>
  );
}
