import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-dark px-6">
      <h1
        className="font-heading text-primary"
        style={{ fontWeight: 900, fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1 }}
      >
        404
      </h1>
      <p
        className="mt-4 font-mono text-text-dim"
        style={{ fontSize: '0.85rem', letterSpacing: '2px' }}
      >
        {'// route_not_found'}
      </p>
      <Link
        to="/"
        className="mt-8 font-heading uppercase text-bg-dark transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: '#00ff88',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '2px',
          borderRadius: 6,
          padding: '12px 24px',
          textDecoration: 'none',
        }}
      >
        Return Home
      </Link>
    </main>
  );
}
