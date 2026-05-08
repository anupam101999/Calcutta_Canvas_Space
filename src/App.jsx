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

function postToRN(msg) {
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  } catch (e) {}
}

function useAndroidBack() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "") || "/";

    // Register on window so App.tsx can call it directly via injectJavaScript
    window.__rnBackPress = function () {
      const dest = BACK_MAP[path];

      if (dest === undefined || dest === "ROOT") {
        postToRN({ type: "BACK_AT_ROOT" });
        return;
      }

      navigate(dest, { replace: true });
      postToRN({ type: "BACK_HANDLED" });
    };

    // Push dummy state to catch popstate (hardware back / gesture)
    window.history.pushState(null, "", path);

    const handlePopState = () => {
      window.__rnBackPress();
      // Re-push so the next back press is also caught
      window.history.pushState(null, "", path);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.__rnBackPress = null;
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

  // Tell App.tsx the web app is ready to receive back messages
  useEffect(() => {
    postToRN({ type: "WEB_READY" });
  }, []);

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