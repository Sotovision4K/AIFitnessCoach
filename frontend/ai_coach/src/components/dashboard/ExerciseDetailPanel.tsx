import type { Exercise } from '@/types/workout';

const BRAND = '#00e676';
const SURFACE = '#1a1a2e';
const DARK = '#0a0a0f';
const DIM = '#8892b0';

interface ExerciseDetailPanelProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export function ExerciseDetailPanel({ exercise, onClose }: ExerciseDetailPanelProps) {
  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const isVisible = exercise !== null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 40,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        aria-hidden="true"
      />

      {/* Slide panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={exercise?.name ?? 'Exercise details'}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '100%',
          maxWidth: 420,
          backgroundColor: SURFACE,
          borderLeft: '1px solid #2a2a3e',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #2a2a3e',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0' }}>
            {exercise?.name ?? ''}
          </span>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid #3a3a4e',
              background: 'none',
              color: '#8892b0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = BRAND;
              (e.currentTarget as HTMLButtonElement).style.color = BRAND;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a4e';
              (e.currentTarget as HTMLButtonElement).style.color = DIM;
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {exercise && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Sets × Reps', value: `${exercise.sets} × ${exercise.reps}`, color: '#f0f0f0' },
                { label: 'Weight', value: exercise.weightKg != null ? `${exercise.weightKg} kg` : '—', color: BRAND },
                { label: 'RPE Target', value: exercise.rpe != null ? String(exercise.rpe) : '—', color: '#f0f0f0' },
                { label: 'Last Week', value: exercise.previousWeightKg != null ? `${exercise.previousWeightKg} kg` : '—', color: DIM },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ backgroundColor: DARK, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM, marginBottom: 4 }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Coaching note */}
            {exercise.notes && (
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM, marginBottom: 8 }}>
                  Coaching Note
                </p>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#ccd6f6', backgroundColor: DARK, borderRadius: 12, padding: '16px', border: '1px solid #2a2a3e' }}>
                  {exercise.notes}
                </p>
              </div>
            )}

            {/* Progression */}
            {exercise.previousWeightKg != null && exercise.weightKg != null && (
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM, marginBottom: 8 }}>
                  Progression
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: DARK, borderRadius: 12, padding: '16px', border: '1px solid #2a2a3e' }}>
                  <div>
                    <p style={{ color: DIM, fontSize: '0.8rem' }}>Previous</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.9rem', color: DIM }}>
                      {exercise.previousWeightKg} kg
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                  <div>
                    <p style={{ color: DIM, fontSize: '0.8rem' }}>Current</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.9rem', color: BRAND }}>
                      {exercise.weightKg} kg
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
