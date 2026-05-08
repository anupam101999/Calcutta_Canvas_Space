import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/RegisterLogin/LoginPage";
import RegisterPage from "./pages/RegisterLogin/RegisterPage";
import HomePage from "./pages/RegisterLogin/HomePage";
import VerifyPhonePage from "./pages/Support/VerifyPhonePage";
import NotificationsPage from "./pages/Updates/NotificationsPage";
import SupportPage from "./pages/Support/SupportPage";
import AccountPage from "./pages/Account/AccountPage";
import EditProfilePage from "./pages/Account/EditProfilePage";
import { Analytics } from "@vercel/analytics/react";
import SupportTicketPage from "./pages/Support/SupportTicketPage";
import ProjectTeamPage from "./pages/Support/ProjectTeamPage";
import Visitmeetingsupport from "./pages/Support/VisitMeetingSupport";
import { hasValidAuthSession } from "./util/authSession";

const BACK_MAP = {
  "/":                            "ROOT",
  "/login":                       "ROOT",
  "/register":                    "ROOT",
  "/home":                        "ROOT",
  "/notifications":               "ROOT",
  "/support":                     "ROOT",
  "/account":                     "ROOT",
  "/verify-phone":                "/home",
  "/editProfile":                 "/account",
  "/support/ticket":              "/support",
  "/support/projectTeam":         "/support",
  "/support/visitmeetingsupport": "/support",
};

// ── Debug logger — shows events on screen ────────────────────────────────
let _setDebugLog = null;
function debugLog(msg) {
  const time = new Date().toLocaleTimeString();
  console.log(`[DEBUG] ${msg}`);
  if (_setDebugLog) {
    _setDebugLog((prev) => [`${time} ${msg}`, ...prev].slice(0, 12));
  }
}

// ── Debug overlay — fixed bottom panel ───────────────────────────────────
function DebugOverlay() {
  const [logs, setLogs] = useState([]);
  const location = useLocation();

  useEffect(() => {
    _setDebugLog = setLogs;
    return () => { _setDebugLog = null; };
  }, []);

  useEffect(() => {
    debugLog(`ROUTE → ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "rgba(0,0,0,0.85)",
      color: "#00ff88",
      fontFamily: "monospace",
      fontSize: "11px",
      padding: "8px",
      zIndex: 99999,
      maxHeight: "200px",
      overflowY: "auto",
      pointerEvents: "none",
    }}>
      <div style={{ color: "#ffcc00", marginBottom: 4 }}>
        🐛 DEBUG — isWebView: {!!window.ReactNativeWebView ? "YES ✅" : "NO ❌"} | path: {location.pathname}
      </div>
      {logs.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}

// ── Back hook with debug ──────────────────────────────────────────────────
function useAndroidBack() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isWebView = !!window.ReactNativeWebView;
    const path = location.pathname.replace(/\/+$/, "") || "/";

    debugLog(`useAndroidBack mounted | path=${path} | isWebView=${isWebView}`);

    // Push dummy state
    window.history.pushState(null, "", path);
    debugLog(`pushState done | history.length=${window.history.length}`);

    const handlePopState = (e) => {
      debugLog(`⬅️ popstate fired | path=${path}`);

      const dest = BACK_MAP[path];
      debugLog(`BACK_MAP[${path}] = ${dest}`);

      if (dest === undefined || dest === "ROOT") {
        window.history.pushState(null, "", path);
        debugLog(`At ROOT — re-pushing state`);

        if (isWebView) {
          debugLog(`Posting BACK_AT_ROOT to RN`);
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "BACK_AT_ROOT" })
          );
        } else {
          debugLog(`Not in WebView — nothing to do`);
        }
        return;
      }

      debugLog(`Navigating to parent: ${dest}`);
      navigate(dest, { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    debugLog(`popstate listener added`);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      debugLog(`popstate listener removed | path=${path}`);
    };
  }, [location.pathname, navigate]);
}

function Protected({ children }) {
  if (!hasValidAuthSession()) return <Navigate to="/login" replace />;
  return children;
}

function StartRoute() {
  return <Navigate to={hasValidAuthSession() ? "/home" : "/login"} replace />;
}

function AppInner() {
  useAndroidBack();

  return (
    <>
      <Analytics />
      <DebugOverlay />
      <Routes>
        <Route path="/" element={<StartRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />
        <Route path="/editProfile" element={<EditProfilePage />} />
        <Route
          path="/support/ticket"
          element={<Protected><SupportTicketPage /></Protected>}
        />
        <Route
          path="/support/projectTeam"
          element={<Protected><ProjectTeamPage /></Protected>}
        />
        <Route
          path="/support/visitmeetingsupport"
          element={<Protected><Visitmeetingsupport /></Protected>}
        />
        <Route
          path="/home"
          element={<Protected><HomePage /></Protected>}
        />
        <Route
          path="/notifications"
          element={<Protected><NotificationsPage /></Protected>}
        />
        <Route
          path="/support"
          element={<Protected><SupportPage /></Protected>}
        />
        <Route
          path="/account"
          element={<Protected><AccountPage /></Protected>}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppInner />;
}