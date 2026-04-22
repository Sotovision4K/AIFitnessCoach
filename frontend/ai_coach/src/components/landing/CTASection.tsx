import { motion } from 'framer-motion';

const scrollReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export function CTASection() {
  return (
    <section style={{ padding: '100px 24px' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max)' }}>
        <motion.div
          className="relative overflow-hidden rounded-lg border border-border-accent text-center"
          style={{ padding: '80px 40px' }}
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Radial gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(0,255,136,0.15), transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p
              className="font-mono uppercase text-primary"
              style={{ fontSize: '0.75rem', letterSpacing: '4px' }}
            >
              {'// ready.execute()'}
            </p>
            <h2
              className="mt-4 font-heading"
              style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}
            >
              Stop Guessing.{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Start Growing.
              </span>
            </h2>
            <p
              className="mx-auto mt-4 font-body text-text-secondary"
              style={{ fontSize: '1rem', maxWidth: 500 }}
            >
              Join IRON MIND and let AI handle the science. You just show up and
              lift.
            </p>
            <a
              href="/onboarding"
              className="mt-8 inline-block font-heading cursor-pointer border-none uppercase text-bg-dark transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#00ff88',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '2px',
                padding: '16px 40px',
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Begin Protocol
            </a>
            <p
              className="mt-4 font-mono text-text-dim"
              style={{ fontSize: '0.7rem' }}
            >
              Powered by AWS Cognito
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
