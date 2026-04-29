export function AuthScreenShell({
  eyebrow,
  title,
  titleItalic,
  description,
  footer,
  children,
}) {
  return (
    <div className="app-shell">
      <div className="auth-shell page-enter">
        <div className="auth-glow auth-glow-top" />
        <div className="auth-glow auth-glow-mid" />
        <div className="auth-glow auth-glow-bot" />
        <div className="page-scroll">
          <div className="auth-scroll">
            <div className="auth-hero">
              <span className="auth-eyebrow-pill">{eyebrow}</span>
              <h1 className="auth-title">
                {titleItalic ? (
                  <>
                    <em>{titleItalic}</em> {title}
                  </>
                ) : (
                  title
                )}
              </h1>
              <p className="auth-desc">{description}</p>
            </div>
            <div className="auth-card">{children}</div>
            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
