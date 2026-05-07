import { useNavigate } from "react-router-dom";
import { BottomTabBar } from "../../components/BottomTabBar";

const CARDS = [
  {
    id: "ticket",
    title: "Open a support ticket 🎫",
    copy: "Share room name, issue summary, and preferred response time.",
    route: "/support/ticket",
  },
  {
    id: "team",
    title: "Talk to the project team 📞",
    copy: "Connect with your designer, execution lead, or relationship manager.",
    route: "/support/projectTeam",
  },
  {
    id: "visit",
    title: "Visit & meeting support",
    copy: "Reschedule site visits, request virtual walkthroughs, or confirm review calls.",
    route: "/support/visitmeetingsupport",
  },
];

export default function SupportPage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="support-content page-enter">
          <h1 className="page-title">Support</h1>
          <p className="page-subtitle">
            Reach your team for scheduling, design clarifications, site queries,
            and account help.
          </p>

          <div className="support-hero">
            <span className="support-hero-eyebrow">Priority Help</span>
            <h2 className="support-hero-title">
              Your coordinator is available today
            </h2>
            <p className="support-hero-copy">
              Raise a concern, ask for a callback, or request an update on
              materials and installation.
            </p>
          </div>

          {CARDS.map((c) => (
            <div
              key={c.id}
              className={`support-card ${
                c.route ? "support-card--clickable" : "support-card--static"
              }`}
              onClick={() => c.route && navigate(c.route)}
            >
              <div className="support-card-header">
                <span className="support-card-title">{c.title}</span>
                <span className="support-card-arrow">›</span>
              </div>
              <p className="support-card-copy">{c.copy}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
