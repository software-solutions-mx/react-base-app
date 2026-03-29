function StateScreen({
  title,
  message,
  icon = 'i',
  variant = 'secondary',
  actionLabel,
  onAction,
  children,
}) {
  return (
    <section className="state-screen" aria-live="polite">
      <div className="state-screen-container">
        <div className={`state-screen-alert state-screen-alert-${variant}`} role="status">
          <div className="state-screen-row">
            <span className="state-screen-icon" aria-hidden="true">
              {icon.slice(0, 1).toUpperCase()}
            </span>
            <div className="state-screen-content">
              <h1 className="state-screen-title">{title}</h1>
              <p className="state-screen-message">{message}</p>
              {children}
              {!children && actionLabel ? (
                <button type="button" className="state-screen-action" onClick={onAction}>
                  {actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StateScreen
