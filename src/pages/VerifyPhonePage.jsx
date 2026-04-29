import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthScreenShell } from "../components/AuthScreenShell";
import { AuthFormField } from "../components/AuthFormField";

export default function VerifyPhonePage() {
  const navigate = useNavigate();
  const pending = JSON.parse(localStorage.getItem("pending_user") || "{}");
  const [phone, setPhone] = useState(pending.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!phone.trim()) {
      setError("Enter your phone number.");
      return;
    }
    try {
      setSending(true);
      setError("");
      // TODO: call your backend OTP send endpoint
      await new Promise((r) => setTimeout(r, 700)); // remove when backend ready
      setOtpSent(true);
      setMessage(`OTP sent to ${phone}. Enter the 6-digit code below.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.trim().length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }
    try {
      setVerifying(true);
      setError("");
      // TODO: call your backend OTP verify endpoint
      await new Promise((r) => setTimeout(r, 700)); // remove when backend ready
      localStorage.removeItem("pending_user");
      // If they came from register, they still need a token — redirect to login
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="Calcutta Canvas Space"
      titleItalic="Verify"
      title="your phone."
      description="Finish account activation with the OTP sent to your Indian mobile number."
      footer={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="auth-footer-text">Need to start over?</span>
          <Link to="/login" className="auth-footer-link">
            Back to login
          </Link>
        </div>
      }
    >
      <div className="auth-card-header">
        <h2 className="auth-card-title">Phone Verification</h2>
        <p className="auth-card-sub">Enter the number you registered with.</p>
      </div>

      <AuthFormField
        label="Phone number"
        type="tel"
        placeholder="+91 98765 43210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={otpSent}
      />

      <button
        className="btn btn--secondary"
        onClick={handleSend}
        disabled={sending || otpSent}
      >
        {sending ? (
          <>
            <div className="spinner spinner--dark" /> Sending…
          </>
        ) : otpSent ? (
          "✓ OTP Sent"
        ) : (
          "Send OTP"
        )}
      </button>

      {otpSent && (
        <>
          <AuthFormField
            label="OTP code"
            type="number"
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <button
            className="btn btn--primary"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? <div className="spinner" /> : "Verify & Continue"}
          </button>
        </>
      )}

      {message && <p className="msg msg--success">{message}</p>}
      {error && <p className="msg msg--error">{error}</p>}
    </AuthScreenShell>
  );
}
