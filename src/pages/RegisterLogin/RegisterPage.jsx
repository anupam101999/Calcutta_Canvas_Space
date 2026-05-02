import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthScreenShell } from "../../components/AuthScreenShell";
import { AuthFormField, AuthTextareaField } from "../../components/AuthFormField";
import {
  DatePickerField,
  DatePickerModal,
} from "../../components/DatePickerModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw) {
  const d = raw.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(d)) return `+91${d}`;
  if (/^0[6-9]\d{9}$/.test(d)) return `+91${d.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(d)) return `+${d}`;
  return null;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [picker, setPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normPhone = useMemo(() => normalizePhone(phone), [phone]);

  const handleCreate = async () => {
    if (
      !fullName ||
      !email ||
      !phone ||
      !dob ||
      !address ||
      !password ||
      !confirm
    ) {
      setError("Complete every field before creating your account.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!normPhone) {
      setError("Enter a valid Indian mobile number (+91 XXXXX XXXXX).");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: email.trim(),
          phone: normPhone,
          dob,
          address,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      // Store returned user in sessionStorage (no navigation)
      sessionStorage.setItem("registered_user", JSON.stringify(data.user));

      // Optional: show a success message or navigate to /login
      navigate("/login", { replace: true });
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthScreenShell
        eyebrow="Calcutta Canvas Space"
        titleItalic="Create"
        title="your account."
        description="Register once with your full details, then verify your phone before entering the dashboard."
        footer={
          <div
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
              marginBottom: "8px",
            }}
          >
            <p className="auth-footer-text">
              Already registered?{" "}
              <Link to="/login" className="auth-footer-link">
                Sign in here
              </Link>
            </p>
          </div>
        }
      >
        <div className="auth-card-header">
          <h2 className="auth-card-title">Register</h2>
          <p className="auth-card-sub">
            Every field is required for the right team access.
          </p>
        </div>

        <AuthFormField
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <AuthFormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="none"
        />
        <AuthFormField
          label="Phone number"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <DatePickerField
          label="Date of birth"
          value={dob}
          onPress={() => setPicker(true)}
        />
        <AuthTextareaField
          label="Address"
          placeholder="House / flat, street, city, state"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <AuthFormField
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <AuthFormField
          label="Confirm password"
          type="password"
          placeholder="Re-enter password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />

        <button
          className="btn btn--green"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? <div className="spinner" /> : "Create Account"}
        </button>

        {normPhone && (
          <p className="msg msg--helper">OTP will be sent to {normPhone}.</p>
        )}
        {error && <p className="msg msg--error">{error}</p>}
      </AuthScreenShell>

      <DatePickerModal
        isOpen={picker}
        onClose={() => setPicker(false)}
        onConfirm={(date) => {
          setDob(date);
          setPicker(false);
        }}
      />
    </>
  );
}
