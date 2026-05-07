import { useNavigate } from "react-router-dom";

const TEAM = [
  {
    name: "Animesh Dutta",
    role: "CEO",
    phone: "+919007522271",
    display: "+91 9007522271",
    initials: "AD",
  },
  {
    name: "Animesh Mandal",
    role: "Chief Designer",
    phone: "+917001299763",
    display: "+91 7001299763",
    initials: "AM",
  },
  {
    name: "Anupam Podder",
    role: "CTO & CFO",
    phone: "+916294390992",
    display: "+91 6294390992",
    initials: "AP",
  },
  {
    name: "Ankit Kumar Jha",
    role: "CMO",
    phone: "+917980008634",
    display: "+91 7980008634",
    initials: "AJ",
  },
];

function handleCall(phone) {
  try {
    if (window.ReactNativeWebView) {
      // Standalone Expo build — send to native layer
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "CALL", phone: "tel:" + phone }),
      );
    } else {
      // Browser or Expo Go
      window.open("tel:" + phone, "_self");
    }
  } catch {
    window.location.href = "tel:" + phone;
  }
}

export default function ProjectTeamPage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="support-content page-enter">
          {/* Header */}
          <div className="inline-center-row">
            <button
              onClick={() => navigate("/support")}
              className="icon-back-btn"
            >
              ‹
            </button>
            <h1 className="page-title">Project Team</h1>
          </div>

          <p className="page-subtitle">
            Connect directly with your design & execution leads.
          </p>

          {/* Hero banner */}
          <div className="support-hero">
            <span className="support-hero-eyebrow">Your Core Team</span>
            <h2 className="support-hero-title">
              We're here to bring your vision to life
            </h2>
            <p className="support-hero-copy">
              Tap the phone number or call button to dial directly.
            </p>
          </div>

          {/* Team cards */}
          {TEAM.map((m) => (
            <div key={m.phone} className="team-card">
              {/* Avatar with image + initials fallback */}
              <div className="team-avatar-wrap">
                <img
                  src="/images/icon.png"
                  alt={m.name}
                  className="team-avatar-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
                {/* Initials fallback — hidden until image fails */}
                <div className="team-avatar-fallback">
                  {m.initials}
                </div>
                {/* Online dot */}
                <div className="team-online-dot" />
              </div>

              {/* Info */}
              <div className="team-info">
                <div className="team-name">
                  {m.name}
                </div>
                <span className="team-role">
                  {m.role}
                </span>
                <div
                  onClick={() => handleCall(m.phone)}
                  className="team-phone"
                >
                  {m.display}
                </div>
              </div>

              {/* Call button */}
              <button
                onClick={() => handleCall(m.phone)}
                className="team-call-btn"
              >
                📞
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
