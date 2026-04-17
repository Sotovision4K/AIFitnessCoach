export function Footer() {
  return (
    <footer className="border-t border-border" style={{ padding: '40px 0' }}>
      <div
        className="mx-auto flex flex-col items-center gap-4 px-6 md:flex-row md:justify-between"
        style={{ maxWidth: 'var(--container-max)' }}
      >
        <span className="font-mono text-text-dim" style={{ fontSize: '0.8rem' }}>
          &copy; 2026 IRON MIND — AI Fitness Protocol
        </span>
        <div className="flex gap-6">
          <a
            href="/privacy"
            className="font-mono text-text-dim transition-colors hover:text-primary"
            style={{ fontSize: '0.8rem' }}
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="font-mono text-text-dim transition-colors hover:text-primary"
            style={{ fontSize: '0.8rem' }}
          >
            Terms
          </a>
          <a
            href="/contact"
            className="font-mono text-text-dim transition-colors hover:text-primary"
            style={{ fontSize: '0.8rem' }}
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
