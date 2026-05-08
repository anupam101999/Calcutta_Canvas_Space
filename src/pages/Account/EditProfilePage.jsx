import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomTabBar } from "../../components/BottomTabBar";
import { getAuthToken } from "../../util/authSession";
import {
  DatePickerField,
  DatePickerModal,
} from "../../components/DatePickerModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw) {
  const d = raw.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(d)) return `+91${d}`;
  if (/^0[6-9]\d{9}$/.test(d)) return `+91${d.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(d)) return `+${d}`;
  if (/^\+91[6-9]\d{9}$/.test(raw.trim())) return raw.trim();
  return null;
}

export default function EditProfilePage() {
  const navigate = useNavigate();

  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const [user, setUser] = useState(stored);

  const name = user.fullName || user.email?.split("@")[0] || "Customer";
  const initial = name[0]?.toUpperCase();

  const [fullName, setFullName] = useState(stored.fullName || "");
  const [email, setEmail] = useState(stored.email || "");
  const [phone, setPhone] = useState(stored.phone || "");
  const [dob, setDob] = useState(stored.dob || "");
  const [address, setAddress] = useState(stored.address || "");
  const [changePass, setChangePass] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [picker, setPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normPhone = useMemo(() => normalizePhone(phone), [phone]);

  const isDirty = useMemo(() => {
    return (
      fullName !== (user.fullName || "") ||
      email !== (user.email || "") ||
      normPhone !== (user.phone || "") ||
      dob !== (user.dob || "") ||
      address !== (user.address || "") ||
      (changePass && password.length > 0)
    );
  }, [fullName, email, normPhone, dob, address, user, changePass, password]);

  const handleSave = async () => {
    if (!isDirty) {
      setError("No changes made.");
      return;
    }
    setError("");
    setSuccess("");

    if (!fullName || !email || !phone || !dob || !address) {
      setError("All fields are required.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!normPhone) {
      setError("Enter a valid Indian mobile number (+91 XXXXX XXXXX).");
      return;
    }
    if (changePass) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    const body = {
      id: user.id,
      fullName,
      email: email.trim(),
      phone: normPhone,
      dob,
      address,
      ...(changePass && password ? { password } : {}),
    };

    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/api/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Update failed.");
        return;
      }

      const updated = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setSuccess("");
        navigate("/account", { replace: true });
      }, 1500);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-scroll">
        <div className="account-content page-enter">
          {/* ── Profile card ── */}
          <div className="profile-card">
            <div className="avatar">
              <span className="avatar-letter">{initial}</span>
            </div>
            <h2 className="profile-name">{name}</h2>
            <p className="profile-email">{user.email || "—"}</p>
            <p className="profile-meta">Test customer · Kolkata</p>
          </div>

          {/* ── Edit form ── */}
          <div className="detail-card detail-card--compact">
            <div className="detail-card-heading">
              <span className="detail-card-title">Edit Profile</span>
              <p className="detail-card-val detail-card-copy">
                Update your details below. All fields are required.
              </p>
            </div>

            <div className="field-wrapper">
              <label className="field-label">Full name</label>
              <input
                className="field-input"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="field-wrapper">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
              />
            </div>

            <div className="field-wrapper">
              <label className="field-label">Phone number</label>
              <input
                className="field-input"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {normPhone && !error && (
                <p className="msg msg--helper msg--small-top">
                  Will save as {normPhone}.
                </p>
              )}
            </div>

            <DatePickerField
              label="Date of birth"
              value={dob}
              onPress={() => setPicker(true)}
            />

            <div className="field-wrapper">
              <label className="field-label">Address</label>
              <textarea
                className="field-input field-input--textarea"
                placeholder="House / flat, street, city, state"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* ── Password toggle ── */}
            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={() => {
                setChangePass((p) => !p);
                setPassword("");
                setConfirm("");
              }}
            >
              {changePass ? "− Cancel password change" : "+ Change password"}
            </button>

            {changePass && (
              <>
                <div className="field-wrapper">
                  <label className="field-label">New password</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Confirm new password</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}
          </div>

          {error && <p className="msg msg--error">{error}</p>}
          {success && <p className="msg msg--success">{success}</p>}

          <button
            type="button"
            className="btn btn--green"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : "Save Changes"}
          </button>

          <button
            type="button"
            className="btn btn--outline"
            onClick={() => navigate("/account", { replace: true })}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>

      <DatePickerModal
        isOpen={picker}
        onClose={() => setPicker(false)}
        onConfirm={(date) => {
          setDob(date);
          setPicker(false);
        }}
      />

      <BottomTabBar />
    </div>
  );
}
