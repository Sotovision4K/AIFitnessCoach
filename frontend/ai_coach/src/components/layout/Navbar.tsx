import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useAuth } from 'react-oidc-context';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const {signinRedirect} = useAuth()


  const redirectToSignIn = () => {
    console.log("Redirecting to sign-in...");
    signinRedirect();
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] transition-all duration-300',
        scrolled ? 'py-3 border-b border-border-accent' : 'py-5 border-b border-border',
      )}
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 'var(--container-max)', padding: '0 24px' }}>
        <a href="/" className="flex items-center gap-3" aria-label="IRON MIND home">
          <span
            className="flex items-center justify-center text-sm"
            style={{
              width: 32,
              height: 32,
              border: '2px solid #00ff88',
              borderRadius: 6,
              color: '#00ff88',
            }}
            aria-hidden="true"
          >
            ⚡
          </span>
          <span
            className="font-heading text-primary"
            style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '3px' }}
          >
            IRON MIND
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => scrollTo('how-it-works')}
            className="font-body uppercase text-text-secondary transition-colors hover:text-primary"
            style={{ fontWeight: 500, fontSize: '0.85rem', letterSpacing: '1px' }}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('benefits')}
            className="font-body uppercase text-text-secondary transition-colors hover:text-primary"
            style={{ fontWeight: 500, fontSize: '0.85rem', letterSpacing: '1px' }}
          >
            Benefits
          </button>
          <a
            onClick={redirectToSignIn}
            className="font-heading cursor-pointer border-none px-5 py-2 uppercase text-bg-dark transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: '#00ff88',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '2px',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className="block h-0.5 w-6 bg-text-secondary transition-transform" />
          <span className="block h-0.5 w-6 bg-text-secondary transition-opacity" />
          <span className="block h-0.5 w-6 bg-text-secondary transition-transform" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="flex flex-col items-center gap-6 py-8 md:hidden"
          aria-label="Mobile navigation"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.98)' }}
        >
          <button
            onClick={() => scrollTo('how-it-works')}
            className="font-body uppercase text-text-secondary transition-colors hover:text-primary"
            style={{ fontWeight: 500, fontSize: '0.85rem', letterSpacing: '1px' }}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('benefits')}
            className="font-body uppercase text-text-secondary transition-colors hover:text-primary"
            style={{ fontWeight: 500, fontSize: '0.85rem', letterSpacing: '1px' }}
          >
            Benefits
          </button>
          <button
            onClick={() => { redirectToSignIn() }}
            className="font-heading cursor-pointer border-none px-5 py-2 uppercase text-bg-dark"
            style={{
              backgroundColor: '#00ff88',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '2px',
              borderRadius: 6,
            }}
          >
            <a  style={{ textDecoration: 'none', color: 'inherit' }}>Get Started</a>
          </button>
        </nav>
      )}
    </nav>
  );
}
