import { useNavigate } from "react-router-dom";
import { BottomTabBar } from "../../components/BottomTabBar";

export default function AccountPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "—";
  const name = user.fullName || email.split("@")[0] || "Customer";
  const initial = name[0].toUpperCase();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("notifications");
    localStorage.removeItem("userId");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="account-content page-enter">
          {/* Profile card */}
          <div className="profile-card">
            <div className="avatar">
              <span className="avatar-letter">{initial}</span>
            </div>
            <h2 className="profile-name">{name}</h2>
            <p className="profile-email">{email}</p>
            <p className="profile-meta">Active customer · Kolkata</p>
          </div>

          {/* Details */}
          <div className="detail-card">
            <span className="detail-card-title">Account Details</span>
            <div className="detail-card-row">
              <span className="detail-card-key">Email</span>
              <span className="detail-card-val">{email}</span>
            </div>
            <div className="detail-card-row">
              <span className="detail-card-key">Phone</span>
              <span className="detail-card-val">
                {user.phone || "Not added"}
              </span>
            </div>
            <div className="detail-card-row">
              <span className="detail-card-key">DOB</span>
              <span className="detail-card-val">{user.dob || "Not added"}</span>
            </div>
            <div className="detail-card-row">
              <span className="detail-card-key">Address</span>
              <span className="detail-card-val">
                {user.address || "Not added"}
              </span>
            </div>
          </div>

          {/* Edit Profile — navigates to dedicated page */}
          <button
            className="btn btn--outline"
            type="button"
            style={{ marginTop: 4 }}
            onClick={() => navigate("/editProfile")}
          >
            Edit Profile
          </button>

          <button
            className="btn btn--danger"
            type="button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
