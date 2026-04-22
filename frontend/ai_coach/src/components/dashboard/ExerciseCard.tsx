import type { Exercise } from '@/types/workout';

const BRAND = '#00e676';
const DIM = '#8892b0';
const SURFACE = '#1a1a2e';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(exercise)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(exercise)}
      style={{
        backgroundColor: SURFACE,
        border: '1px solid #2a2a3e',
        borderRadius: 16,
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 0 20px rgba(0, 230, 118, 0.1)';
        el.style.borderColor = BRAND;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
        el.style.borderColor = '#2a2a3e';
      }}
    >
      {/* Top: name + RPE badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, color: '#f0f0f0', flex: 1 }}>
          {exercise.name}
        </h4>
        {exercise.rpe != null && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            color: BRAND,
            border: `1px solid ${BRAND}4d`,
            borderRadius: 999,
            padding: '2px 8px',
            marginLeft: 8,
            whiteSpace: 'nowrap',
          }}>
            RPE {exercise.rpe}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {[
          { label: 'SETS', value: exercise.sets, color: '#f0f0f0' },
          { label: 'REPS', value: exercise.reps, color: '#f0f0f0' },
          ...(exercise.weightKg != null ? [{ label: 'WEIGHT', value: `${exercise.weightKg}kg`, color: BRAND }] : []),
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: DIM }}>
              {label}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom: previous + details link */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: DIM }}>
          {exercise.previousWeightKg != null ? `Previous: ${exercise.previousWeightKg}kg` : ''}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: BRAND, display: 'flex', alignItems: 'center', gap: 2 }}>
          Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

