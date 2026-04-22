import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { PROGRESSION_BARS } from '@/constants/data';

export function ProgressionChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section style={{ padding: '100px 24px' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max)' }}>
        <div
          ref={containerRef}
          className="rounded-lg border border-border-accent bg-bg-card"
          style={{ padding: '60px 40px' }}
        >
          <div
            className="mx-auto flex items-end justify-center"
            style={{ gap: 24, height: 320 }}
          >
            {PROGRESSION_BARS.map((bar, i) => (
              <div
                key={bar.week}
                className="flex flex-col items-center"
              >
                {/* Value */}
                <span
                  className="mb-2 font-mono text-primary"
                  style={{ fontSize: '0.75rem' }}
                >
                  {bar.weightKg}
                </span>

                {/* Bar */}
                <motion.div
                  className="bg-gradient-to-t from-emerald-400 to-cyan-400"
                  style={{
                    width: 60,
                    borderRadius: '4px 4px 0 0',
                  }}
                  initial={{ height: 0 }}
                  animate={isInView ? { height: bar.heightPx } : { height: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />

                {/* Label */}
                <span
                  className="mt-3 font-heading text-text-dim"
                  style={{ fontSize: '0.65rem' }}
                >
                  {bar.week}
                </span>
              </div>
            ))}
          </div>

          <p
            className="mt-8 text-center font-mono text-text-dim"
            style={{ fontSize: '0.75rem' }}
          >
            Bench Press progression over 8 weeks — auto-calculated by IRON MIND
          </p>
        </div>
      </div>
    </section>
  );
}
