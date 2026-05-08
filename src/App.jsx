import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
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

// ── Back-navigation map ───────────────────────────────────────────────────
// "ROOT" = no parent — back should minimize the app
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

// ── Hook: intercepts Android hardware back button ─────────────────────────
function useAndroidBack() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isWebView = !!window.ReactNativeWebView;

    // Push a dummy history entry so popstate fires before the browser acts
    window.history.pushState(null, "", location.pathname);

    const handlePopState = () => {
      const path = location.pathname.replace(/\/+$/, "") || "/";
      const dest = BACK_MAP[path];

      if (dest === undefined || dest === "ROOT") {
        // At a root screen — tell RN to minimize, re-push state to block browser
        window.history.pushState(null, "", path);
        if (isWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "BACK_AT_ROOT" })
          );
        }
        return;
      }

      // Navigate to the defined parent route
      navigate(dest, { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location.pathname, navigate]);
}

// ── Guards ────────────────────────────────────────────────────────────────
function Protected({ children }) {
  if (!hasValidAuthSession()) return <Navigate to="/login" replace />;
  return children;
}

function StartRoute() {
  return <Navigate to={hasValidAuthSession() ? "/home" : "/login"} replace />;
}

// ── AppInner: needs to be inside router context to use hooks ──────────────
function AppInner() {
  useAndroidBack();

  return (
    <>
      <Analytics />
      <Routes>
        <Route path="/" element={<StartRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />
        <Route path="/editProfile" element={<EditProfilePage />} />
        <Route
          path="/support/ticket"
          element={
            <Protected>
              <SupportTicketPage />
            </Protected>
          }
        />
        <Route
          path="/support/projectTeam"
          element={
            <Protected>
              <ProjectTeamPage />
            </Protected>
          }
        />
        <Route
          path="/support/visitmeetingsupport"
          element={
            <Protected>
              <Visitmeetingsupport />
            </Protected>
          }
        />
        <Route
          path="/home"
          element={
            <Protected>
              <HomePage />
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <NotificationsPage />
            </Protected>
          }
        />
        <Route
          path="/support"
          element={
            <Protected>
              <SupportPage />
            </Protected>
          }
        />
        <Route
          path="/account"
          element={
            <Protected>
              <AccountPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppInner />;
}