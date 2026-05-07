import { useState, useEffect } from "react";
import { BottomTabBar } from "../../components/BottomTabBar";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

/* ─── API ─────────────────────────────────────────────────────────────────── */
async function fetchNotifications(userId) {
  const res = await fetch(`${BASE_URL}/api/myNotifications/${userId}`);
  const data = await res.json();
  return data.tickets;
}

async function clearNotification(userId, ticketId) {
  const res = await fetch(
    `${BASE_URL}/api/myNotifications/${userId}/${ticketId}`,
    {
      method: "DELETE",
    },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not clear notification.");
  }
}

async function clearAllNotifications(userId) {
  const res = await fetch(`${BASE_URL}/api/myNotifications/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not clear notifications.");
  }
}

function getCachedNotifications() {
  try {
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/* ─── Detail view ─────────────────────────────────────────────────────────── */
function TicketDetail({ ticket, onBack, onClear, clearing }) {
  const label = ticket.type || cap(ticket.category);
  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="notif-content page-enter">
          <div className="inline-center-row stack-header">
            <button className="icon-back-btn" onClick={onBack}>
              ‹
            </button>
            <h1 className="page-title page-title--flush">Ticket Details</h1>
          </div>

          <div className="detail-header">
            <span
              className={`notif-badge badge-${(ticket.type || "").toLowerCase()}`}
            >
              {label}
            </span>
            <h2 className="detail-subject">{ticket.subject}</h2>
            <p className="detail-id">ID: {ticket.ticket_id}</p>
          </div>

          <div className="detail-card">
            <p className="detail-card-title">Details</p>
            <div className="detail-row">
              <span className="detail-label">Category</span>
              <span className="detail-value">{cap(ticket.category)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span
                className={`status-pill status-${(ticket.status || "").toLowerCase()}`}
              >
                {ticket.status}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {formatDate(ticket.created_at)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Updated</span>
              <span className="detail-value">
                {formatDate(ticket.updated_at)}
              </span>
            </div>
          </div>

          <div className="detail-card">
            <p className="detail-card-title">Your Query</p>
            <p className="detail-text">{ticket.query}</p>
          </div>

          <div className="detail-card">
            <p className="detail-card-title">Support Team Reply</p>
            <p className="detail-text">{ticket.reply}</p>
          </div>

          <button
            className="btn btn--danger"
            type="button"
            onClick={onClear}
            disabled={clearing}
          >
            {clearing ? <span className="spinner" /> : "Clear Notification"}
          </button>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}

/* ─── Notification card ───────────────────────────────────────────────────── */
function NotifCard({ n, onSelect, onClearOne, clearing }) {
  const isRead = n.status === "closed";
  const label = n.type || cap(n.category);

  return (
    <div
      className={`notif-card ${isRead ? "notif-card--read" : ""}`}
      onClick={() => onSelect(n)}
    >
      <div className="notif-card-inner">
        {/* Unread dot */}
        <div className={`notif-dot ${isRead ? "notif-dot--read" : ""}`} />

        {/* Body */}
        <div className="notif-card-body" style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              className={`notif-badge badge-${(n.type || "").toLowerCase()}`}
            >
              {label}
            </span>
            <span
              className="notif-time"
              style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
            >
              {timeAgo(n.created_at)}
            </span>
          </div>
          <p className="notif-msg">{n.subject}</p>
        </div>

        {/* Per-card clear button — stops propagation so it doesn't open detail */}
        <button
          type="button"
          className="notif-clear-btn"
          disabled={clearing}
          onClick={(e) => {
            e.stopPropagation();
            onClearOne(n.ticket_id);
          }}
          aria-label="Clear notification"
          title="Clear"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const [cached] = useState(() => getCachedNotifications());
  const [notifications, setNotifications] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);

  const userId = localStorage.getItem("userId");

  const persistNotifications = (next) => {
    setNotifications(next);
    localStorage.setItem("notifications", JSON.stringify(next));
  };

  useEffect(() => {
    if (cached) return;
    fetchNotifications(userId)
      .then((data) => {
        persistNotifications(data);
      })
      .catch((e) => setError(e.message || "Could not load notifications."))
      .finally(() => setLoading(false));
  }, [cached, userId]);

  /* ── clear one ── */
  const handleClearOne = async (ticketId) => {
    try {
      setClearing(true);
      setError("");
      await clearNotification(userId, ticketId);
      persistNotifications(
        notifications.filter((n) => n.ticket_id !== ticketId),
      );
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setClearing(false);
    }
  };

  /* ── clear all ── */
  const handleClearAll = async () => {
    if (!notifications.length) return;
    try {
      setClearing(true);
      setError("");
      await clearAllNotifications(userId);
      persistNotifications([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setClearing(false);
    }
  };

  /* ── detail view ── */
  if (selected) {
    return (
      <TicketDetail
        ticket={selected}
        onBack={() => setSelected(null)}
        onClear={() => handleClearOne(selected.ticket_id)}
        clearing={clearing}
      />
    );
  }

  const unread = notifications.filter((n) => n.status !== "closed");
  const read = notifications.filter((n) => n.status === "closed");

  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="notif-content page-enter">
          {/* ── Page header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">
                Project alerts, design approvals, visit schedules, and team
                messages.
              </p>
            </div>

            {/* Clear All — top right, only when there's something to clear */}
            {notifications.length > 0 && (
              <button
                type="button"
                className="btn btn--ghost"
                style={{
                  width: "auto",
                  minHeight: 36,
                  padding: "6px 14px",
                  fontSize: 13,
                  flexShrink: 0,
                  marginTop: 4,
                  color: "var(--danger, #c62828)",
                  border: "1.5px solid currentColor",
                }}
                disabled={clearing}
                onClick={handleClearAll}
              >
                {clearing ? <span className="spinner" /> : "Clear all"}
              </button>
            )}
          </div>

          {/* ── Summary pill ── */}
          {notifications.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {unread.length > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--clay-pale)",
                    borderRadius: "var(--r-full)",
                    padding: "5px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    color: "var(--clay-deep)",
                    fontWeight: 600,
                  }}
                ></span>
              )}
              {read.length > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--bg-alt)",
                    borderRadius: "var(--r-full)",
                    padding: "5px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    fontWeight: 500,
                  }}
                >
                  {read.length} read
                </span>
              )}
            </div>
          )}

          {error && <p className="msg msg--error">{error}</p>}
          {loading && <p className="notif-empty">Loading notifications…</p>}

          {!loading && notifications.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🔔</div>
              <p className="notif-empty">You're all caught up.</p>
            </div>
          )}

          {/* ── Unread ── */}
          {unread.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "var(--text-4)",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              ></div>
              {unread.map((n) => (
                <NotifCard
                  key={n.ticket_id}
                  n={n}
                  onSelect={setSelected}
                  onClearOne={handleClearOne}
                  clearing={clearing}
                />
              ))}
            </div>
          )}

          {/* ── Read ── */}
          {read.length > 0 && (
            <div style={{ marginTop: unread.length ? 20 : 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "var(--text-4)",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Earlier
              </div>
              {read.map((n) => (
                <NotifCard
                  key={n.ticket_id}
                  n={n}
                  onSelect={setSelected}
                  onClearOne={handleClearOne}
                  clearing={clearing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
