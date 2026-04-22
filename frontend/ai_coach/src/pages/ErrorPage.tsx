const SUPPORT_EMAIL = 'sotivisionhdmi@gmail.com';

interface ErrorPageProps {
  message?: string;
}

export function ErrorPage({ message }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-dark px-6">
      <p
        className="font-mono text-danger"
        style={{ fontSize: '0.85rem', letterSpacing: '2px' }}
      >
        {'// runtime_error'}
      </p>

      <h1
        className="mt-4 font-heading text-text-primary"
        style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '1px' }}
      >
        SOMETHING WENT WRONG
      </h1>

      <p className="mt-2 font-mono text-text-secondary" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
        {message ?? 'An unexpected error occurred.'}
      </p>

      <div
        className="mt-8 rounded-lg border border-border-accent bg-bg-card px-6 py-4 font-mono text-text-dim"
        style={{ fontSize: '0.75rem', lineHeight: 1.8, letterSpacing: '0.5px' }}
      >
        <p>{'> '}You can try one of the following:</p>
        <p className="mt-1 pl-4">{'—'} Return to the home page</p>
        <p className="pl-4">{'—'} Contact support if the issue persists</p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <a
          href="/"
          className="font-heading cursor-pointer border-none uppercase text-bg-dark"
          style={{
            backgroundColor: '#00ff88',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '2px',
            padding: '12px 28px',
            borderRadius: 6,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          ← Home
        </a>

        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=App Error Report&body=Error: ${encodeURIComponent(message ?? 'Unknown error')}`}
          className="rounded-lg border border-border-accent font-heading uppercase text-text-secondary transition-colors hover:border-primary hover:text-primary"
          style={{
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '2px',
            padding: '12px 28px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Contact Support
        </a>
      </div>

      <p className="mt-4 font-mono text-text-dim" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
        {SUPPORT_EMAIL}
      </p>
    </main>
  );
}
