import { useState } from "react";
import { getAuthToken } from "../../util/authSession";

/* ════════════════════════════════════════════════════════════════
   CONFIG — swap USE_MOCK to false when backend is ready
════════════════════════════════════════════════════════════════ */
const USE_MOCK = true; // ← flip to false to hit real API
const BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.example.com";

/* ─── API layer ───────────────────────────────────────────────────
 *
 * POST {BASE_URL}/api/support/ticket
 *
 * Request body:
 * {
 *   appointmentType : string,   // "Site Visit" | "Virtual Walkthrough" | …
 *   subject         : string,
 *   category        : string,
 *   query           : string,
 *   preferredDate   : string,   // "YYYY-MM-DD"
 *   preferredTime   : string,   // "HH:MM"
 *   isReschedule    : boolean,
 *   originalId      ?: string,
 * }
 *
 * Expected response: { id, status, confirmationMsg }
 * ─────────────────────────────────────────────────────────────── */
async function apiBookAppointment(body) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      id: body.isReschedule ? body.originalId : `APT-${Date.now()}`,
      status: "pending",
      confirmationMsg: body.isReschedule
        ? "Your appointment has been rescheduled successfully."
        : "Booking received. We'll confirm within a few hours.",
    };
  }

  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/api/support/ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "Request failed");
    throw new Error(msg);
  }
  return res.json(); // { id, status, confirmationMsg }
}

/* ─── Mock existing appointments ────────────────────────────── */
const MOCK_APPOINTMENTS = [
  {
    id: "APT-001",
    type: "Site Visit",
    subject: "Kitchen tile inspection",
    category: "Material Review",
    date: "2025-05-12",
    time: "11:00",
    status: "confirmed",
    note: "Check wall tiles delivery status and grout samples.",
  },
  {
    id: "APT-002",
    type: "Review Call",
    subject: "Living room layout final sign-off",
    category: "Design Approval",
    date: "2025-05-18",
    time: "15:30",
    status: "pending",
    note: "",
  },
  {
    id: "APT-003",
    type: "Virtual Walkthrough",
    subject: "3D render review — master bedroom",
    category: "Design Approval",
    date: "2025-04-30",
    time: "14:00",
    status: "cancelled",
    note: "Client requested cancellation.",
  },
];

/* ─── Static data ─────────────────────────────────────────────── */
const APPT_TYPES = [
  {
    value: "Site Visit",
    emoji: "🏗️",
    desc: "In-person check of materials, progress, or installation",
  },
  {
    value: "Virtual Walkthrough",
    emoji: "💻",
    desc: "Video call to review 3D renders or progress photos",
  },
  {
    value: "Review Call",
    emoji: "📞",
    desc: "Quick call with your designer or execution lead",
  },
  {
    value: "Design Consultation",
    emoji: "🎨",
    desc: "Deep-dive on finishes, layouts, or sourcing decisions",
  },
  {
    value: "Other",
    emoji: "💬",
    desc: "Any other visit, call, or coordination need",
  },
];

const CATEGORIES = [
  "Material Review",
  "Design Approval",
  "Site Inspection",
  "Scheduling",
  "Query / Clarification",
  "Billing & Invoices",
  "Other",
];

const TIMES = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00",
  "14:30", "15:00", "15:30", "16:00", "16:30",
];

const STATUS_LABELS = {
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
};

const STATUS_META = {
  confirmed: { bg: "#e8f5e9", color: "#2e7d32", label: STATUS_LABELS.confirmed },
  pending: { bg: "#fff3e0", color: "#b45309", label: STATUS_LABELS.pending },
  cancelled: { bg: "#fce4ec", color: "#c62828", label: STATUS_LABELS.cancelled },
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const todayStr = () => new Date().toISOString().split("T")[0];

function fmtDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

const typeEmoji = (type) =>
  APPT_TYPES.find((t) => t.value === type)?.emoji ?? "📋";

/* ════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   Props:
     onBack?: () => void   — shown as back button on list screen
════════════════════════════════════════════════════════════════ */
export default function VisitMeetingSupport({ onBack }) {
  const [view, setView]                 = useState("list"); // list | book | confirm
  const [rescheduleTarget, setTarget]   = useState(null);
  const [appointments, setAppts]        = useState(MOCK_APPOINTMENTS);
  const [confirmed, setConfirmed]       = useState(null);
  const [isReschedule, setIsReschedule] = useState(false);

  const emptyForm = { type:"", subject:"", category:"", query:"", date:"", time:"" };
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(1);      // 1 | 2 | 3
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  /* ── navigation helpers ── */
  function openBook() {
    setForm(emptyForm); setStep(1);
    setApiError(""); setTarget(null); setIsReschedule(false);
    setView("book");
  }

  function openReschedule(apt) {
    setForm({ type: apt.type, subject: apt.subject,
              category: apt.category, query: apt.note ?? "",
              date: "", time: "" });
    setStep(3);
    setApiError(""); setTarget(apt); setIsReschedule(true);
    setView("book");
  }

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  function canNext() {
    if (isReschedule)   return !!form.date && !!form.time;
    if (step === 1)     return !!form.type;
    if (step === 2)     return form.subject.trim().length > 2 && !!form.category;
    if (step === 3)     return !!form.date && !!form.time;
    return false;
  }

  /* ── submit ── */
  async function handleSubmit() {
    setLoading(true); setApiError("");
    try {
      const body = {
        appointmentType: form.type,
        subject:         form.subject,
        category:        form.category,
        query:           form.query,
        preferredDate:   form.date,
        preferredTime:   form.time,
        isReschedule,
        ...(isReschedule ? { originalId: rescheduleTarget.id } : {}),
      };

      const result = await apiBookAppointment(body);

      const newApt = {
        id:       result.id,
        type:     form.type,
        subject:  form.subject,
        category: form.category,
        date:     form.date,
        time:     form.time,
        status:   result.status ?? "pending",
        note:     form.query,
        confirmationMsg: result.confirmationMsg,
      };

      if (isReschedule) {
        setAppts((p) => p.map((a) => (a.id === rescheduleTarget.id ? newApt : a)));
      } else {
        setAppts((p) => [newApt, ...p]);
      }

      setConfirmed(newApt);
      setView("confirm");
    } catch (e) {
      setApiError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── render ── */
  return (
    <div className="page-scroll page-enter">
      {view === "list" && (
        <ListScreen
          appointments={appointments}
          onBook={openBook}
          onReschedule={openReschedule}
          onBack={onBack}
        />
      )}
      {view === "book" && (
        <BookScreen
          form={form}
          step={step}
          setStep={setStep}
          setF={setF}
          isReschedule={isReschedule}
          rescheduleTarget={rescheduleTarget}
          canNext={canNext}
          loading={loading}
          apiError={apiError}
          onSubmit={handleSubmit}
          onBack={() => {
            if (!isReschedule && step > 1) setStep((s) => s - 1);
            else setView("list");
          }}
        />
      )}
      {view === "confirm" && confirmed && (
        <ConfirmScreen
          apt={confirmed}
          isReschedule={isReschedule}
          onDone={() => setView("list")}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LIST SCREEN
════════════════════════════════════════════════════════════════ */
function ListScreen({ appointments, onBook, onReschedule, onBack }) {
  const active    = appointments.filter((a) => a.status !== "cancelled");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  return (
    <div className="support-content">
      {/* Header */}
      <div className="support-header-row">
        {onBack && (
          <button
            className="btn btn--ghost support-back-compact"
            onClick={onBack}
          >←</button>
        )}
        <div>
          <h1 className="page-title">Visit &amp; Meetings</h1>
          <p className="page-subtitle">Schedule, view, or reschedule your appointments.</p>
        </div>
      </div>

      {/* Hero CTA */}
      <div className="support-hero">
        <span className="support-hero-eyebrow">📅 New Appointment</span>
        <p className="support-hero-title">Request a visit or call</p>
        <p className="support-hero-copy">
          Site visits · Virtual walkthroughs · Review calls · Design consultations — all in one place.
        </p>
        <button
          className="btn btn--secondary support-hero-action"
          onClick={onBook}
        >
          + New Appointment
        </button>
      </div>

      {/* Active appointments */}
      {active.length > 0 && (
        <div className="section">
          <div className="section-header">
            <span className="section-title">Upcoming</span>
            <span className="section-count">
              {active.length} scheduled
            </span>
          </div>
          {active.map((apt) => (
            <ApptCard key={apt.id} apt={apt} onReschedule={onReschedule} />
          ))}
        </div>
      )}

      {/* Cancelled */}
      {cancelled.length > 0 && (
        <div className="section">
          <span className="section-title section-title--muted">
            Cancelled
          </span>
          {cancelled.map((apt) => (
            <ApptCard key={apt.id} apt={apt} onReschedule={onReschedule} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {appointments.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize:40, marginBottom:10 }}>🗓️</div>
          <p className="page-subtitle empty-state-copy">No appointments yet</p>
          <button
            className="btn btn--primary empty-state-action"
            onClick={onBook}
          >
            Book your first one
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Appointment card ─────────────────────────────────────── */
function ApptCard({ apt, onReschedule }) {
  const [open, setOpen] = useState(false);
  const status = apt.status || "pending";
  const st = STATUS_META[status] ?? STATUS_META.pending;

  return (
    <div className="support-card" onClick={() => setOpen((p) => !p)}>
      {/* Top row */}
      <div className="support-card-header">
        <div className="appt-title-stack">
          <div className="appt-title-row">
            <span className="appt-emoji">{typeEmoji(apt.type)}</span>
            <span
              className="support-card-title appt-subject"
            >
              {apt.subject}
            </span>
          </div>
          <span className="appt-meta">
            {apt.type} · {apt.category}
          </span>
        </div>
        <span style={{
          fontSize:18, color:"var(--clay)", flexShrink:0,
          transition:"transform 0.2s", transform: open ? "rotate(90deg)" : "none",
        }}>›</span>
      </div>

      {/* Date + status */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6, paddingLeft:28, flexWrap:"wrap" }}>
        <span style={{ fontSize:13, color:"var(--text-3)" }}>📆 {fmtDate(apt.date)}</span>
        <span style={{ fontSize:13, color:"var(--text-3)" }}>·</span>
        <span style={{ fontSize:13, color:"var(--text-3)" }}>🕐 {apt.time}</span>
        <span
          className="status-pill"
          style={{ background:st.bg, color:st.color, marginLeft:"auto" }}
        >
          {st.label}
        </span>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{
          marginTop:12, paddingTop:12,
          borderTop:"1px solid var(--border)",
          display:"flex", flexDirection:"column", gap:10,
        }}>
          {apt.note && (
            <p className="support-card-copy" style={{ fontStyle:"italic" }}>"{apt.note}"</p>
          )}
          <div style={{ display:"flex", gap:8 }}>
            {apt.status !== "cancelled" ? (
              <button
                className="btn btn--outline"
                style={{ minHeight:40, fontSize:13, flex:1 }}
                onClick={(e) => { e.stopPropagation(); onReschedule(apt); }}
              >
                🔄 Reschedule
              </button>
            ) : (
              <button
                className="btn btn--secondary"
                style={{ minHeight:40, fontSize:13, flex:1 }}
                onClick={(e) => { e.stopPropagation(); onReschedule(apt); }}
              >
                📅 Book Again
              </button>
            )}
          </div>
          <span style={{
            fontFamily:"var(--font-mono)", fontSize:10,
            color:"var(--text-4)", letterSpacing:"0.8px",
          }}>
            Ref: {apt.id}
          </span>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BOOK / RESCHEDULE SCREEN
════════════════════════════════════════════════════════════════ */
const STEP_LABELS = ["Type", "Details", "Date & Time"];

function BookScreen({
  form, step, setStep, setF,
  isReschedule, rescheduleTarget,
  canNext, loading, apiError, onSubmit, onBack,
}) {
  return (
    <div className="support-content">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <button
          className="btn btn--ghost"
          style={{ width:"auto", minHeight:38, padding:"6px 14px", flexShrink:0, marginTop:4 }}
          onClick={onBack}
        >←</button>
        <div>
          <h1 className="page-title">{isReschedule ? "Reschedule" : "New Appointment"}</h1>
          {isReschedule && rescheduleTarget && (
            <p className="page-subtitle">{rescheduleTarget.subject}</p>
          )}
        </div>
      </div>

      {/* Step progress bar (new booking only) */}
      {!isReschedule && (
        <div style={{ display:"flex", gap:8 }}>
          {STEP_LABELS.map((lbl, i) => {
            const active = i + 1 === step;
            const done   = i + 1 < step;
            return (
              <div key={lbl} style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{
                  height:4, borderRadius:99,
                  background: done || active ? "var(--clay)" : "var(--border-2)",
                  opacity: done ? 0.5 : active ? 1 : 0.3,
                  transition:"all 0.25s",
                }} />
                <span style={{
                  fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"1px",
                  textTransform:"uppercase",
                  color: active ? "var(--clay)" : "var(--text-4)",
                  fontWeight: active ? 700 : 400,
                }}>
                  {done ? "✓ " : ""}{lbl}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ STEP 1 — Type ══ */}
      {step === 1 && !isReschedule && (
        <div className="section">
          <span className="section-title">What type of appointment?</span>
          {APPT_TYPES.map((t) => {
            const sel = form.type === t.value;
            return (
              <div
                key={t.value}
                className="support-card"
                style={{
                  borderColor: sel ? "var(--clay)" : "var(--border)",
                  background:  sel ? "var(--clay-pale)" : "var(--surface)",
                  transition: "all 0.15s",
                }}
                onClick={() => setF("type", t.value)}
              >
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{
                    fontSize:24, width:40, height:40, flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: sel ? "rgba(143,59,46,0.12)" : "var(--bg-alt)",
                    borderRadius:"var(--r-sm)",
                  }}>
                    {t.emoji}
                  </span>
                  <div style={{ flex:1 }}>
                    <div className="support-card-title" style={{ color: sel ? "var(--clay-deep)" : "var(--text)" }}>
                      {t.value}
                    </div>
                    <div className="support-card-copy">{t.desc}</div>
                  </div>
                  {/* Radio circle */}
                  <div style={{
                    width:20, height:20, borderRadius:"50%", flexShrink:0,
                    border:`2px solid ${sel ? "var(--clay)" : "var(--border-2)"}`,
                    background: sel ? "var(--clay)" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.15s",
                  }}>
                    {sel && <span style={{ color:"#fff7f2", fontSize:12, lineHeight:1 }}>✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ STEP 2 — Details ══ */}
      {step === 2 && !isReschedule && (
        <div className="section" style={{ gap:16 }}>
          <span className="section-title">Tell us more</span>

          {/* Type recap pill */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8, alignSelf:"flex-start",
            background:"var(--clay-pale)", borderRadius:"var(--r-full)", padding:"6px 14px",
          }}>
            <span style={{ fontSize:16 }}>{typeEmoji(form.type)}</span>
            <span style={{
              fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:"1.1px",
              textTransform:"uppercase", color:"var(--clay-deep)", fontWeight:600,
            }}>
              {form.type}
            </span>
          </div>

          {/* Subject */}
          <div className="field-wrapper">
            <label className="field-label">Subject *</label>
            <input
              className="field-input"
              placeholder="e.g. Kitchen tile delivery check"
              value={form.subject}
              maxLength={120}
              onChange={(e) => setF("subject", e.target.value)}
            />
            <span className="msg msg--helper" style={{ textAlign:"right" }}>
              {form.subject.length}/120
            </span>
          </div>

          {/* Category */}
          <div className="field-wrapper">
            <label className="field-label">Category *</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {CATEGORIES.map((cat) => {
                const sel = form.category === cat;
                return (
                  <div
                    key={cat}
                    style={{
                      padding:"10px 12px", borderRadius:"var(--r-md)",
                      border:`1.5px solid ${sel ? "var(--clay)" : "var(--border)"}`,
                      background: sel ? "var(--clay-pale)" : "var(--surface)",
                      cursor:"pointer", fontSize:13, lineHeight:1.35,
                      fontWeight: sel ? 700 : 500,
                      color: sel ? "var(--clay-deep)" : "var(--text-2)",
                      transition:"all 0.12s", touchAction:"manipulation",
                    }}
                    onClick={() => setF("category", cat)}
                  >
                    {cat}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Query / notes */}
          <div className="field-wrapper">
            <label className="field-label">
              Query / Notes{" "}
              <span style={{ color:"var(--text-4)", fontWeight:400 }}>(optional)</span>
            </label>
            <textarea
              className="field-input field-input--textarea"
              placeholder="Any questions or context the team should know…"
              value={form.query}
              rows={3}
              onChange={(e) => setF("query", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Date & Time (new booking) ══ */}
      {step === 3 && !isReschedule && (
        <DateTimeStep form={form} setF={setF} isReschedule={false} />
      )}

      {/* ══ RESCHEDULE — recap + new date/time ══ */}
      {isReschedule && (
        <>
          <div className="detail-card" style={{ gap:8 }}>
            <div className="detail-card-title">Rescheduling</div>
            <SummaryRow label="Type"     val={`${typeEmoji(form.type)} ${form.type}`} />
            <SummaryRow label="Subject"  val={form.subject} />
            <SummaryRow label="Category" val={form.category} />
            <SummaryRow label="Old slot" val={`${fmtDate(rescheduleTarget.date)} · ${rescheduleTarget.time}`} />
          </div>
          <DateTimeStep form={form} setF={setF} isReschedule={true} />
        </>
      )}

      {/* Booking summary before confirm (step 3, new) */}
      {step === 3 && !isReschedule && form.date && form.time && (
        <div className="detail-card" style={{ gap:8 }}>
          <div className="detail-card-title">Booking Summary</div>
          <SummaryRow label="Type"     val={`${typeEmoji(form.type)} ${form.type}`} />
          <SummaryRow label="Subject"  val={form.subject} />
          <SummaryRow label="Category" val={form.category} />
          {form.query && <SummaryRow label="Notes" val={form.query} />}
          <SummaryRow label="Date"     val={fmtDate(form.date)} />
          <SummaryRow label="Time"     val={form.time} />
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div style={{
          background:"rgba(163,52,40,0.08)",
          border:"1px solid rgba(163,52,40,0.2)",
          borderRadius:"var(--r-md)", padding:"12px 16px",
        }}>
          <p className="msg msg--error">⚠️ {apiError}</p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display:"flex", gap:10 }}>
        {!isReschedule && step > 1 && (
          <button
            className="btn btn--ghost"
            style={{ flex:1 }}
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}

        {!isReschedule && step < 3 && (
          <button
            className="btn btn--primary"
            style={{ flex:2 }}
            disabled={!canNext()}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue →
          </button>
        )}

        {(step === 3 || isReschedule) && (
          <button
            className="btn btn--green"
            style={{ flex:2 }}
            disabled={!canNext() || loading}
            onClick={onSubmit}
          >
            {loading ? (
              <><span className="spinner" />{isReschedule ? "Rescheduling…" : "Booking…"}</>
            ) : isReschedule ? "Confirm Reschedule" : "Confirm Booking"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Date & time sub-section ─────────────────────────────── */
function DateTimeStep({ form, setF, isReschedule }) {
  return (
    <div className="section" style={{ gap:14 }}>
      <span className="section-title">
        {isReschedule ? "Pick a new date & time" : "When works for you?"}
      </span>

      <div className="field-wrapper">
        <label className="field-label">Date *</label>
        <input
          type="date"
          className="field-input"
          min={todayStr()}
          value={form.date}
          onChange={(e) => setF("date", e.target.value)}
        />
      </div>

      <div className="field-wrapper">
        <label className="field-label">Preferred time *</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
          {TIMES.map((t) => {
            const sel = form.time === t;
            return (
              <div
                key={t}
                style={{
                  padding:"10px 4px", borderRadius:"var(--r-md)", textAlign:"center",
                  border:`1.5px solid ${sel ? "var(--clay)" : "var(--border)"}`,
                  background: sel ? "var(--clay)" : "var(--surface)",
                  color: sel ? "#fff7f2" : "var(--text-2)",
                  fontWeight: sel ? 700 : 500,
                  fontSize:13, cursor:"pointer",
                  transition:"all 0.12s", touchAction:"manipulation",
                }}
                onClick={() => setF("time", t)}
              >
                {t}
              </div>
            );
          })}
        </div>
      </div>

      {/* New schedule preview (reschedule only) */}
      {isReschedule && form.date && form.time && (
        <div style={{
          background:"var(--green)", borderRadius:"var(--r-lg)",
          padding:"16px 18px", display:"flex", flexDirection:"column", gap:4,
        }}>
          <span style={{
            fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"1.2px",
            textTransform:"uppercase", color:"var(--amber-pale)",
          }}>
            New schedule
          </span>
          <span style={{
            fontFamily:"var(--font-serif)", fontSize:22, fontWeight:600,
            color:"#fff7f2", lineHeight:1.2,
          }}>
            {fmtDate(form.date)} · {form.time}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Shared summary row ─────────────────────────────────── */
function SummaryRow({ label, val }) {
  return (
    <div className="detail-card-row">
      <span className="detail-card-key">{label}</span>
      <span className="detail-card-val">{val}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONFIRM SCREEN
════════════════════════════════════════════════════════════════ */
function ConfirmScreen({ apt, isReschedule, onDone }) {
  return (
    <div className="support-content" style={{ alignItems:"center" }}>
      <div style={{
        width:80, height:80, borderRadius:"50%",
        background: isReschedule ? "var(--amber-pale)" : "var(--green-pale)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:40, margin:"16px auto 0",
      }}>
        {isReschedule ? "🔄" : "✅"}
      </div>

      <div style={{ textAlign:"center" }}>
        <h1 className="page-title" style={{ textAlign:"center" }}>
          {isReschedule ? "Rescheduled!" : "Booking Confirmed!"}
        </h1>
        <p className="page-subtitle" style={{ textAlign:"center", maxWidth:300, margin:"4px auto 0" }}>
          {apt.confirmationMsg}
        </p>
      </div>

      {/* Appointment summary card */}
      <div className="auth-card" style={{ width:"100%", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
          <span style={{
            fontSize:28, width:48, height:48, flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"var(--bg-alt)", borderRadius:"var(--r-md)",
          }}>
            {typeEmoji(apt.type)}
          </span>
          <div>
            <div style={{
              fontFamily:"var(--font-serif)", fontSize:20, fontWeight:600,
              color:"var(--text)", lineHeight:1.25,
            }}>
              {apt.subject}
            </div>
            <div style={{
              fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"1.1px",
              textTransform:"uppercase", color:"var(--clay)", marginTop:3,
            }}>
              {apt.type} · {apt.category}
            </div>
          </div>
        </div>

        <hr className="divider" />
        <SummaryRow label="Date"   val={fmtDate(apt.date)} />
        <SummaryRow label="Time"   val={apt.time} />
        <SummaryRow label="Status" val="Pending confirmation" />
        {apt.note && <SummaryRow label="Notes" val={apt.note} />}
        <hr className="divider" />
        <span style={{
          fontFamily:"var(--font-mono)", fontSize:10,
          color:"var(--text-4)", letterSpacing:"0.8px",
        }}>
          Ref: {apt.id}
        </span>
      </div>

      <button className="btn btn--primary" style={{ marginTop:4 }} onClick={onDone}>
        Back to Appointments
      </button>
    </div>
  );
}
