import { Navigate, Route, Routes } from "react-router-dom";
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


function Protected({ children }) {
  if (!hasValidAuthSession()) return <Navigate to="/login" replace />;
  return children;
}

function StartRoute() {
  return <Navigate to={hasValidAuthSession() ? "/home" : "/login"} replace />;
}

export default function App() {
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
