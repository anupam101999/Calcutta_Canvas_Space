import { useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const YEARS = Array.from({ length: 80 }, (_, i) =>
  String(new Date().getFullYear() - 18 - i),
);

export function DatePickerField({
  label,
  value,
  placeholder = "DD / MM / YYYY",
  onPress,
}) {
  return (
    <div className="field-wrapper">
      <span className="field-label">{label}</span>
      <button type="button" className="field-picker" onClick={onPress}>
        <span
          className={`field-picker-text ${value ? "" : "field-picker-placeholder"}`}
        >
          {value || placeholder}
        </span>
        <span className="field-picker-icon">📅</span>
      </button>
    </div>
  );
}

function PickerCol({ label, items, selected, onSelect }) {
  return (
    <div className="picker-col">
      <span className="picker-col-label">{label}</span>
      <div className="picker-list">
        {items.map((item) => (
          <div
            key={item}
            className={`picker-option ${selected === item ? "picker-option--active" : ""}`}
            onClick={() => onSelect(item)}
          >
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DatePickerModal({ isOpen, onClose, onConfirm }) {
  const [day, setDay] = useState("01");
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState("2000");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const monthNum = String(MONTHS.indexOf(month) + 1).padStart(2, "0");
    onConfirm(`${day}/${monthNum}/${year}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title">Date of Birth</h2>
          <p className="modal-sub">
            Select the date that matches your official records.
          </p>
        </div>
        <div className="picker-grid">
          <PickerCol
            label="Day"
            items={DAYS}
            selected={day}
            onSelect={setDay}
          />
          <PickerCol
            label="Month"
            items={MONTHS}
            selected={month}
            onSelect={setMonth}
          />
          <PickerCol
            label="Year"
            items={YEARS}
            selected={year}
            onSelect={setYear}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
