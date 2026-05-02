import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BottomTabBar } from "../components/BottomTabBar";

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
      const token = localStorage.getItem("token");
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
          <div
            className="account-content page-enter"
            style={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: "70vh",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--green, #2d5a3d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
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
            <h2 className="profile-name" style={{ marginBottom: 8 }}>
              Ticket Submitted!
            </h2>
            <p
              className="detail-card-val"
              style={{
                color: "var(--text-3)",
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 280,
                margin: "0 auto 28px",
              }}
            >
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
          <div style={{ marginBottom: 4 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: "none",
                border: "none",
                padding: "4px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--text-2, #555)",
                fontSize: 14,
                marginBottom: 12,
              }}
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
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                color: "var(--text-1, #1a1a1a)",
              }}
            >
              Open a Support Ticket 🎫
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-3, #888)",
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
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
            <div className="detail-card-row" style={{ border: "none" }}>
              <span className="detail-card-key">Phone</span>
              <span className="detail-card-val">{phone || "Not added"}</span>
            </div>
          </div>

          {/* ── Ticket form ── */}
          <div className="detail-card" style={{ gap: 14 }}>
            <span className="detail-card-title">Ticket Details 🎫 </span>

            {/* Category */}
            <div className="field-wrapper">
              <label className="field-label">Category</label>
              <select
                className="field-input"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setError("");
                }}
                style={{
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: 36,
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
              <label
                className="field-label"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Subject</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color:
                      subject.length >= 110
                        ? subject.length >= 118
                          ? "#c0392b"
                          : "#e67e22"
                        : "var(--text-3, #888)",
                  }}
                >
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
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "var(--border, #e5e5e5)",
                  marginTop: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(subject.length / 120) * 100}%`,
                    background:
                      subject.length >= 118
                        ? "#c0392b"
                        : subject.length >= 110
                          ? "#e67e22"
                          : "var(--green, #2d5a3d)",
                    transition: "width 0.2s ease, background 0.3s ease",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
            {/* Query */}
            <div className="field-wrapper">
              <label
                className="field-label"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Your query</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color:
                      charsLeft < 200
                        ? charsLeft < 50
                          ? "#c0392b"
                          : "#e67e22"
                        : "var(--text-3, #888)",
                  }}
                >
                  {charsUsed} / {MAX_CHARS}
                </span>
              </label>
              <textarea
                ref={textareaRef}
                className="field-input field-input--textarea"
                placeholder="Describe your issue in detail — include room names, dates, or any relevant context..."
                value={query}
                maxLength={MAX_CHARS}
                rows={8}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError("");
                }}
                style={{ resize: "vertical", minHeight: 160 }}
              />
              {/* Char progress bar */}
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "var(--border, #e5e5e5)",
                  marginTop: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(charsUsed / MAX_CHARS) * 100}%`,
                    background:
                      charsLeft < 50
                        ? "#c0392b"
                        : charsLeft < 200
                          ? "#e67e22"
                          : "var(--green, #2d5a3d)",
                    transition: "width 0.2s ease, background 0.3s ease",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="msg msg--error" style={{ marginTop: 0 }}>
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn--green"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 4 }}
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
