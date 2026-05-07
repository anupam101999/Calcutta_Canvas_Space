import { Link, useLocation } from "react-router-dom";

const TABS = [
  { to: "/home", label: "Home", icon: "⌂" },
  { to: "/notifications", label: "Updates", icon: "🔔" },
  { to: "/support", label: "Support", icon: "💬" },
  { to: "/account", label: "Account", icon: "◉" },
];

export function BottomTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => {
        const active = pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`tab-item ${active ? "tab-item--active" : ""}`}
            replace
          >
            <span className="tab-icon">
              {tab.icon}
            </span>
            <span className="tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
