export function AuthFormField({ label, className = "", ...inputProps }) {
  return (
    <div className="field-wrapper">
      <label className="field-label">{label}</label>
      <input className={`field-input ${className}`} {...inputProps} />
    </div>
  );
}

export function AuthTextareaField({ label, className = "", ...props }) {
  return (
    <div className="field-wrapper">
      <label className="field-label">{label}</label>
      <textarea
        className={`field-input field-input--textarea ${className}`}
        {...props}
      />
    </div>
  );
}
