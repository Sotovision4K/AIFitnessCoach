import { motion } from 'framer-motion';
import { HOW_IT_WORKS_STEPS } from '@/constants/data';
import { TerminalVisual } from './TerminalVisual';
import type { StepData } from '@/types/landing';

const scrollReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function Step({ step, index }: { step: StepData; index: number }) {
  const labels = [
    '// user_input.json',
    '// workout_plan.output',
    '// progression.diff',
  ];

  return (
    <motion.div
      className="grid gap-8 lg:gap-12"
      style={{
        gridTemplateColumns: 'clamp(50px, 5vw, 80px) 1fr',
        padding: '40px 0',
      }}
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Number */}
      <div>
        <span
          className="font-heading text-primary"
          style={{
            fontWeight: 900,
            fontSize: '2.5rem',
            textShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
          }}
        >
          {step.number}
        </span>
      </div>

      {/* Content + Terminal */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3
            className="font-heading uppercase text-text-primary"
            style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}
          >
            {step.title}
          </h3>
          <p
            className="mt-3 font-body text-text-secondary"
            style={{ fontSize: '0.95rem', lineHeight: 1.8 }}
          >
            {step.description}
          </p>
          <ul className="mt-4 list-none space-y-2 p-0">
            {step.details.map((detail) => (
              <li
                key={detail}
                className="font-body text-text-dim"
                style={{ fontSize: '0.8rem' }}
              >
                — {detail}
              </li>
            ))}
          </ul>
        </div>
        <TerminalVisual
          lines={step.terminalContent}
          label={labels[index] ?? '// output'}
        />
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '100px 24px' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max)' }}>
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p
            className="font-mono uppercase text-primary"
            style={{ fontSize: '0.75rem', letterSpacing: '4px' }}
          >
            {'// protocol.init()'}
          </p>
          <h2
            className="mt-4 font-heading"
            style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}
          >
            Three Steps.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Zero Guesswork.
            </span>
          </h2>
          <p
            className="mx-auto mt-4 font-body text-text-secondary"
            style={{ fontSize: '1.05rem', maxWidth: 600 }}
          >
            From raw input to fully optimized training — the entire pipeline
            runs on autopilot.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <Step key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
