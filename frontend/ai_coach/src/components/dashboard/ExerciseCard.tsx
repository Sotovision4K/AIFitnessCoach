import type { Exercise } from '@/types/workout';

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const weightDiff =
    exercise.previousWeightKg != null && exercise.weightKg != null
      ? exercise.weightKg - exercise.previousWeightKg
      : null;

  return (
    <div className="rounded-lg border border-border-accent bg-bg-card p-4 transition-colors hover:bg-bg-card-hover">
      <div className="flex items-start justify-between">
        <h4 className="font-heading text-text-primary" style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
          {exercise.name}
        </h4>
        {exercise.rpe != null && (
          <span className="font-mono text-text-dim" style={{ fontSize: '0.7rem' }}>
            RPE {exercise.rpe}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-6">
        <div>
          <span className="font-mono text-text-dim" style={{ fontSize: '0.65rem' }}>SETS</span>
          <p className="font-heading text-primary" style={{ fontWeight: 800, fontSize: '1rem' }}>
            {exercise.sets}
          </p>
        </div>
        <div>
          <span className="font-mono text-text-dim" style={{ fontSize: '0.65rem' }}>REPS</span>
          <p className="font-heading text-primary" style={{ fontWeight: 800, fontSize: '1rem' }}>
            {exercise.reps}
          </p>
        </div>
        {exercise.weightKg != null && (
          <div>
            <span className="font-mono text-text-dim" style={{ fontSize: '0.65rem' }}>WEIGHT</span>
            <p className="flex items-center gap-1 font-heading" style={{ fontWeight: 800, fontSize: '1rem' }}>
              <span className="text-primary">{exercise.weightKg}kg</span>
              {weightDiff != null && weightDiff > 0 && (
                <span className="font-mono text-primary" style={{ fontSize: '0.7rem' }}>
                  ↑ +{weightDiff}kg
                </span>
              )}
              {weightDiff != null && weightDiff < 0 && (
                <span className="font-mono text-danger" style={{ fontSize: '0.7rem' }}>
                  ↓ {weightDiff}kg
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {exercise.notes && (
        <p className="mt-3 font-mono text-text-dim" style={{ fontSize: '0.75rem' }}>
          // {exercise.notes}
        </p>
      )}
    </div>
  );
}
