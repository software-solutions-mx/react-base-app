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
    <section className="container py-5" aria-live="polite">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className={`alert alert-${variant} border-0 shadow-sm`} role="status">
            <div className="d-flex align-items-start gap-3">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-bold"
                style={{ width: '2rem', height: '2rem', lineHeight: 1 }}
                aria-hidden="true"
              >
                {icon.slice(0, 1).toUpperCase()}
              </span>
              <div className="w-100">
                <h1 className="h4 mb-2">{title}</h1>
                <p className="mb-3">{message}</p>
                {children}
                {!children && actionLabel ? (
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={onAction}
                  >
                    {actionLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StateScreen
