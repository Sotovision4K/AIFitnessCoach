import { motion } from 'framer-motion';
import { BENEFITS_CARDS } from '@/constants/data';

const scrollReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export function Benefits() {
  return (
    <section id="benefits" style={{ padding: '100px 24px' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max)' }}>
        <motion.div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {BENEFITS_CARDS.map((card) => (
            <motion.article
              key={card.title}
              className="group relative overflow-hidden bg-bg-card transition-colors hover:bg-bg-card-hover"
              style={{ padding: '48px 36px' }}
              variants={scrollReveal}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100"
              />

              <span
                className="block"
                style={{ fontSize: '1.5rem', marginBottom: 20 }}
                aria-hidden="true"
              >
                {card.icon}
              </span>
              <h3
                className="font-heading uppercase text-text-primary"
                style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}
              >
                {card.title}
              </h3>
              <p
                className="mt-3 font-body text-text-secondary"
                style={{ fontSize: '0.9rem', lineHeight: 1.7 }}
              >
                {card.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
