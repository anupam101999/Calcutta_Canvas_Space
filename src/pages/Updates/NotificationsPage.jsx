import { useState, useEffect } from "react";
import { BottomTabBar } from "../../components/BottomTabBar";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ── helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60) return `${m} min ago`;
  if (h < 24) return `${h} hr ago`;
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
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

// ── fetch ──────────────────────────────────────────────────────────────────

async function fetchNotifications(userId) {
  const res = await fetch(`${BASE_URL}/api/myNotifications/${userId}`);
  const data = await res.json();
  return data.tickets;
}

async function clearNotification(userId, ticketId) {
  const res = await fetch(`${BASE_URL}/api/myNotifications/${userId}/${ticketId}`, {
    method: "DELETE",
  });

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
  const stored = localStorage.getItem("notifications");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    console.error("Invalid localStorage data");
    return null;
  }
}

// ── Detail View ────────────────────────────────────────────────────────────

function TicketDetail({ ticket, onBack, onClear }) {
  const label = ticket.type || cap(ticket.category);

  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="notif-content page-enter">
          {/* Back button — same style as ProjectTeamPage */}
          <div className="inline-center-row stack-header">
            <button
              className="icon-back-btn"
              onClick={onBack}
            >
              ‹
            </button>
            <h1 className="page-title page-title--flush">
              Ticket Details
            </h1>
          </div>

          {/* Header */}
          <div className="detail-header">
            <span
              className={`notif-badge badge-${(ticket.type || "").toLowerCase()}`}
            >
              {label}
            </span>
            <h2 className="detail-subject">{ticket.subject}</h2>
            <p className="detail-id">ID: {ticket.ticket_id}</p>
          </div>

          {/* Details card */}
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

          {/* Query */}
          <div className="detail-card">
            <p className="detail-card-title">Your Query :</p>
            <p className="detail-text">{ticket.query}</p>
          </div>

          {/* Reply */}
          <div className="detail-card">
            <p className="detail-card-title">Support Team Reply :</p>
            <p className="detail-text">{ticket.reply}</p>
          </div>

          <button className="btn btn--danger" type="button" onClick={onClear}>
            Clear Notification
          </button>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [cached] = useState(() => getCachedNotifications());
  const [notifications, setNotifications] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);

  const userId = localStorage.getItem("userId");
  const persistNotifications = (next) => {
    setNotifications(next);
    localStorage.setItem("notifications", JSON.stringify(next));
  };

  useEffect(() => {
    if (cached) return;

    // Only runs if no local data
    fetchNotifications(userId)
      .then((data) => {
        setNotifications(data);
        localStorage.setItem("notifications", JSON.stringify(data)); // optional: cache it
      })
      .catch((e) => setError(e.message || "Could not load notifications."))
      .finally(() => setLoading(false));
  }, [cached, userId]);

  const toggleSelected = (ticketId) => {
    setSelectedIds((current) =>
      current.includes(ticketId)
        ? current.filter((id) => id !== ticketId)
        : [...current, ticketId],
    );
  };

  const handleClearOne = async (ticketId) => {
    try {
      setClearing(true);
      setError("");
      await clearNotification(userId, ticketId);
      persistNotifications(notifications.filter((n) => n.ticket_id !== ticketId));
      setSelectedIds((ids) => ids.filter((id) => id !== ticketId));
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setClearing(false);
    }
  };

  const handleClearSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      setClearing(true);
      setError("");
      await Promise.all(selectedIds.map((ticketId) => clearNotification(userId, ticketId)));
      const selectedSet = new Set(selectedIds);
      persistNotifications(notifications.filter((n) => !selectedSet.has(n.ticket_id)));
      setSelectedIds([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setClearing(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;

    try {
      setClearing(true);
      setError("");
      await clearAllNotifications(userId);
      persistNotifications([]);
      setSelectedIds([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setClearing(false);
    }
  };

  if (selected) {
    return (
      <TicketDetail
        ticket={selected}
        onBack={() => setSelected(null)}
        onClear={() => handleClearOne(selected.ticket_id)}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="notif-content page-enter">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Project alerts, design approvals, visit schedules, and team
            messages.
          </p>

          {notifications.length > 0 && (
            <div className="notif-actions">
              <button
                className="btn btn--outline btn--compact"
                type="button"
                disabled={clearing || selectedIds.length === 0}
                onClick={handleClearSelected}
              >
                Clear Selected
              </button>
              <button
                className="btn btn--danger btn--compact"
                type="button"
                disabled={clearing}
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          )}

          {error && <p className="msg msg--error">{error}</p>}

          {loading && <p className="notif-empty">Loading notifications…</p>}

          {!loading && notifications.length === 0 && (
            <p className="notif-empty">No notifications yet.</p>
          )}

          {notifications.map((n) => {
            const isRead = n.status === "closed";
            const label = n.type || cap(n.category);

            return (
              <div
                key={n.ticket_id}
                className={`notif-card ${isRead ? "notif-card--read" : ""}`}
                onClick={() => setSelected(n)}
              >
                <div className="notif-card-inner">
                  <button
                    type="button"
                    className={`notif-select ${
                      selectedIds.includes(n.ticket_id) ? "notif-select--active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelected(n.ticket_id);
                    }}
                    aria-label={`Select ${n.subject}`}
                  >
                    {selectedIds.includes(n.ticket_id) ? "✓" : ""}
                  </button>
                  <div
                    className={`notif-dot ${isRead ? "notif-dot--read" : ""}`}
                  />
                  <div className="notif-card-body">
                    <span
                      className={`notif-badge badge-${(n.type || "").toLowerCase()}`}
                    >
                      {label}
                    </span>
                    <p className="notif-msg">{n.subject}</p>
                    <span className="notif-time">{timeAgo(n.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
