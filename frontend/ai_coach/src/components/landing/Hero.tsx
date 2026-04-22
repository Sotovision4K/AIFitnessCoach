import { motion } from 'framer-motion';
import { HERO_STATS } from '@/constants/data';

const scrollReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export function Hero() {
  return (
    <section className="relative" style={{ padding: '160px 24px 100px' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max)' }}>
        <motion.div initial="hidden" animate="visible" variants={scrollReveal}>
          {/* Tagline */}
          <p
            className="font-mono uppercase text-primary"
            style={{ fontSize: '0.8rem', letterSpacing: '0.2em' }}
          >
            <span style={{ animation: 'blink 1s infinite' }}>{'>'}</span>{' '}
            AI-Powered Coaching Protocol
          </p>

          {/* Heading */}
          <h1
            className="mt-6 font-heading"
            style={{
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 1.1,
            }}
          >
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Your Coach
            </span>
            <br />
            <span className="text-text-dim">Never Sleeps.</span>
          </h1>

          {/* Description */}
          <p
            className="mt-6 font-body text-text-secondary"
            style={{ fontSize: '1.15rem', maxWidth: 560, lineHeight: 1.8 }}
          >
            IRON MIND builds hyper-personalized workout plans that evolve every
            week. Powered by AI, driven by your data, designed to push you
            forward — automatically.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/onboarding"
              className="font-heading cursor-pointer border-none uppercase text-bg-dark transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#00ff88',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '2px',
                padding: '14px 32px',
                borderRadius: 6,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Start Training
            </a>
            <button
              onClick={() =>
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="font-heading cursor-pointer uppercase text-primary transition-all hover:bg-primary-glow"
              style={{
                background: 'transparent',
                border: '1px solid #00ff88',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '2px',
                padding: '14px 32px',
                borderRadius: 6,
              }}
            >
              See How It Works
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div
          className="mt-20 flex flex-wrap gap-12 border-t border-border pt-10"
        >
          {HERO_STATS.map((stat) => (
            <div key={stat.label}>
              <span
                className="font-heading text-primary"
                style={{ fontWeight: 800, fontSize: '2rem' }}
              >
                {stat.value}
              </span>
              <p
                className="mt-1 font-body uppercase text-text-dim"
                style={{ fontSize: '0.8rem', letterSpacing: '2px' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
