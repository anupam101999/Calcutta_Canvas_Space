import { BottomTabBar } from "../components/BottomTabBar";

const UPDATES = [
  {
    id: 1,
    badge: "Design",
    msg: "Your revised living room mood board is ready for review.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    badge: "Vendor",
    msg: "Vendor quotes for wardrobe finishes were added this morning.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 3,
    badge: "Visit",
    msg: "Support confirmed tomorrow's measurement visit at 11:00 AM.",
    time: "3 hr ago",
    read: false,
  },
  {
    id: 4,
    badge: "Approval",
    msg: "Kitchen lighting approval is pending your confirmation.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    badge: "Payment",
    msg: "Milestone 2 invoice has been generated and sent to your email.",
    time: "Yesterday",
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="notif-content page-enter">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Project alerts, design approvals, visit schedules, and team
            messages.
          </p>

          {UPDATES.map((u) => (
            <div
              key={u.id}
              className={`notif-card ${u.read ? "notif-card--read" : ""}`}
            >
              <div className="notif-card-inner">
                <div className="notif-dot" />
                <div className="notif-card-body">
                  <span className="notif-badge">{u.badge}</span>
                  <p className="notif-msg">{u.msg}</p>
                  <span className="notif-time">{u.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
