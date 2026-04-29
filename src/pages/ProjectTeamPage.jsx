import { useNavigate } from "react-router-dom";

const TEAM = [
  {
    name: "Animesh Mandal",
    role: "Chief Architect",
    phone: "+917001299763",
    display: "+91 7001299763",
    initials: "AM",
  },
  {
    name: "Animesh Dutta",
    role: "CEO",
    phone: "+919007522271",
    display: "+91 9007522271",
    initials: "AD",
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/support")}
              style={{
                background: "var(--clay-pale)",
                border: "none",
                borderRadius: "var(--r-sm)",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 20,
                color: "var(--clay)",
                flexShrink: 0,
              }}
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
            <div
              key={m.phone}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-xl)",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Avatar with image + initials fallback */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src="/images/icon.png"
                  alt={m.name}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "center",
                    border: "2.5px solid var(--amber-pale)",
                    display: "block",
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
                {/* Initials fallback — hidden until image fails */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "var(--green)",
                    border: "2.5px solid var(--amber-pale)",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-serif)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#fff7f2",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  {m.initials}
                </div>
                {/* Online dot */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 13,
                    height: 13,
                    background: "#2d9e6b",
                    borderRadius: "50%",
                    border: "2px solid var(--surface)",
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                    lineHeight: 1.25,
                  }}
                >
                  {m.name}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 5,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "var(--clay-deep)",
                    background: "var(--clay-pale)",
                    padding: "3px 9px",
                    borderRadius: 999,
                  }}
                >
                  {m.role}
                </span>
                <div
                  onClick={() => handleCall(m.phone)}
                  style={{
                    fontSize: 13,
                    color: "var(--clay)",
                    marginTop: 6,
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                    cursor: "pointer",
                  }}
                >
                  {m.display}
                </div>
              </div>

              {/* Call button */}
              <button
                onClick={() => handleCall(m.phone)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--clay-pale)",
                  border: "1.5px solid var(--amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 18,
                  cursor: "pointer",
                }}
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
