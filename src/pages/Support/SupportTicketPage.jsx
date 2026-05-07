import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BottomTabBar } from "../../components/BottomTabBar";
import { getAuthToken } from "../../util/authSession";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const MAX_CHARS = 2000;

const CATEGORIES = [
  { value: "", label: "Select a category" },
  { value: "scheduling", label: "Scheduling & site visits" },
  { value: "design", label: "Design clarifications" },
  { value: "materials", label: "Material & delivery queries" },
  { value: "installation", label: "Installation issues" },
  { value: "billing", label: "Billing & payments" },
  { value: "other", label: "Other" },
];

export default function SupportTicketPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const textareaRef = useRef(null);

  // Pre-populated (read-only)
  const userId = user.id || "";
  const fullName = user.fullName || "";
  const email = user.email || "";
  const phone = user.phone || "";

  // Form state
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const charsLeft = MAX_CHARS - query.length;
  const charsUsed = query.length;
  const subjectMeterClass =
    subject.length >= 118
      ? "meter meter--danger"
      : subject.length >= 110
        ? "meter meter--warn"
        : "meter";
  const queryMeterClass =
    charsLeft < 50
      ? "meter meter--danger"
      : charsLeft < 200
        ? "meter meter--warn"
        : "meter";
  const subjectCountClass =
    subject.length >= 118
      ? "char-count char-count--danger"
      : subject.length >= 110
        ? "char-count char-count--warn"
        : "char-count";
  const queryCountClass =
    charsLeft < 50
      ? "char-count char-count--danger"
      : charsLeft < 200
        ? "char-count char-count--warn"
        : "char-count";

  const validate = () => {
    if (!category) return "Please select a category.";
    if (!subject.trim()) return "Please enter a subject.";
    if (subject.length > 120) return "Subject must not exceed 120 characters.";
    if (!query.trim()) return "Please describe your issue.";
    if (query.length > MAX_CHARS)
      return `Query must not exceed ${MAX_CHARS} characters.`;
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");

    const body = {
      userId,
      category,
      subject: subject.trim(),
      query: query.trim(),
      type: "Ticket",
    };

    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/api/support/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to submit ticket. Please try again.");
        return;
      }
      localStorage.removeItem("notifications");
      setSuccess(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (success) {
    return (
      <div className="app-shell">
        <div className="page-scroll">
          <div className="account-content page-enter success-content">
            <div className="success-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="profile-name success-title">
              Ticket Submitted!
            </h2>
            <p className="detail-card-val success-copy">
              Your query has been received. Our team will get back to you within
              24 hours on <strong>{email}</strong>.
            </p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate("/support", { replace: true })}
            >
              Back to Support
            </button>
          </div>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="account-content page-enter">
          {/* ── Header ── */}
          <div className="stack-header">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-back-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <h1 className="form-title">
              Open a Support Ticket 🎫
            </h1>
            <p className="form-subtitle">
              Describe your issue and our team will respond within 24 hours.
            </p>
          </div>

          {/* ── Pre-filled info (read-only) ── */}
          <div className="detail-card">
            <span className="detail-card-title">Your Details</span>
            <div className="detail-card-row">
              <span className="detail-card-key">Name</span>
              <span className="detail-card-val">{fullName || "—"}</span>
            </div>
            <div className="detail-card-row">
              <span className="detail-card-key">Email</span>
              <span className="detail-card-val">{email || "—"}</span>
            </div>
            <div className="detail-card-row detail-card-row--last">
              <span className="detail-card-key">Phone</span>
              <span className="detail-card-val">{phone || "Not added"}</span>
            </div>
          </div>

          {/* ── Ticket form ── */}
          <div className="detail-card detail-card--compact">
            <span className="detail-card-title">Ticket Details 🎫 </span>

            {/* Category */}
            <div className="field-wrapper">
              <label className="field-label">Category</label>
              <select
                className="field-input field-input--select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setError("");
                }}
              >
                {CATEGORIES.map((c) => (
                  <option
                    key={c.value}
                    value={c.value}
                    disabled={c.value === ""}
                  >
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Subject */}
            <div className="field-wrapper">
              <label className="field-label field-label--split">
                <span>Subject</span>
                <span className={subjectCountClass}>
                  {subject.length} / 120
                </span>
              </label>
              <input
                className="field-input"
                type="text"
                placeholder="Brief summary of your issue"
                value={subject}
                maxLength={120}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setError("");
                }}
              />
              {/* Char progress bar */}
              <progress
                className={subjectMeterClass}
                value={subject.length}
                max={120}
              />
            </div>
            {/* Query */}
            <div className="field-wrapper">
              <label className="field-label field-label--split">
                <span>Your query</span>
                <span className={queryCountClass}>
                  {charsUsed} / {MAX_CHARS}
                </span>
              </label>
              <textarea
                ref={textareaRef}
                className="field-input field-input--textarea field-input--resize"
                placeholder="Describe your issue in detail — include room names, dates, or any relevant context..."
                value={query}
                maxLength={MAX_CHARS}
                rows={8}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError("");
                }}
              />
              {/* Char progress bar */}
              <progress
                className={queryMeterClass}
                value={charsUsed}
                max={MAX_CHARS}
              />
            </div>
          </div>

          {error && (
            <p className="msg msg--error msg--flush">
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn--green btn--top-space"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : "Submit Ticket"}
          </button>

          <button
            type="button"
            className="btn btn--outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
