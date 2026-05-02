import { BottomTabBar } from "../../components/BottomTabBar";

const STATS = [
  {
    value: "03",
    label: "Active projects",
    note: "2 in design, 1 in execution",
  },
  { value: "04", label: "Meetings this week", note: "Next call at 5:30 PM" },
  {
    value: "06",
    label: "Open approvals",
    note: "Materials & drawings pending",
  },
];

const SECTIONS = [
  {
    title: "Featured Portfolios",
    items: [
      {
        name: "Serene Apartment Refresh",
        detail: "Soft oak palette, textured walls, layered lighting concept",
      },
      {
        name: "Boutique Office Studio",
        detail: "Collaborative zones, glass partitions, earthy reception",
      },
    ],
  },
  {
    title: "Current Project Status",
    items: [
      {
        name: "Lake View Residence",
        detail: "Site measurements approved. Kitchen drawings under review.",
      },
      {
        name: "Canvas Café Expansion",
        detail:
          "Vendor shortlist ready. Material board presentation due Friday.",
      },
    ],
  },
];

const ESSENTIALS = [
  {
    title: "Portfolio Vault",
    copy: "Browse finished homes and workspace transformations.",
  },
  {
    title: "Team Connect",
    copy: "Reach your designer, project lead, and coordinator.",
  },
  {
    title: "Material Tracker",
    copy: "Track approvals, sourcing, and installation phases.",
  },
  { title: "Support Hub", copy: "Raise questions or schedule visits anytime." },
];

export default function HomePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user.fullName
    ? user.fullName.split(" ")[0]
    : (user.email || "Customer").split("@")[0];
  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="home-content page-enter">
          {/* ── Hero ── */}
          <div className="hero-card">
            <div className="hero-top-row">
              <div className="hero-text">
                <span className="hero-kicker">Calcutta Canvas Space</span>
                <h1 className="hero-greeting">
                  Hello,
                  <br />
                  {firstName}
                </h1>
                <p className="hero-sub">
                  Your design dashboard — project movement, portfolio
                  inspiration, and team updates.
                </p>
              </div>
              <span className="live-badge">Live</span>
            </div>
            <div className="highlight-card">
              <span className="highlight-eyebrow">Today's Focus</span>
              <h3 className="highlight-title">Concept review at 6:00 PM</h3>
              <p className="highlight-copy">
                Interior layouts, finish selections, and revised electrical
                points lined up for confirmation.
              </p>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="stats-list">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
                <span className="stat-note">{s.note}</span>
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="action-strip">
            <div className="action-card action-card--primary">
              <span className="action-card-title-light">Book Design Call</span>
              <span className="action-card-copy-light">
                Connect with the design team for layouts, portfolio
                walkthroughs, and next steps.
              </span>
            </div>
            {/* <div className="action-card action-card--secondary">
              <span className="action-card-title-dark">Share Inspiration</span>
              <span className="action-card-copy-dark">
                Upload references, colour ideas, and room inspirations for your
                ongoing project.
              </span>
            </div> */}
          </div>

          {/* ── Sections ── */}
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="section">
              <div className="section-header">
                <h2 className="section-title">{sec.title}</h2>
                <span className="see-all">View all</span>
              </div>
              {sec.items.map((item) => (
                <div key={item.name} className="list-card">
                  <div className="list-thumb" />
                  <div className="list-body">
                    <span className="list-title">{item.name}</span>
                    <span className="list-detail">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
