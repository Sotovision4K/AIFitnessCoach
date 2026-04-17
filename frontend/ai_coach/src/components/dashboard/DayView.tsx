import { ExerciseCard } from './ExerciseCard';
import type { WorkoutDay } from '@/types/workout';

interface DayViewProps {
  day: WorkoutDay;
}

export function DayView({ day }: DayViewProps) {
  return (
    <section>
      <h3
        className="mb-4 font-heading uppercase text-text-secondary"
        style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '2px' }}
      >
        Day {day.dayNumber} — {day.label}
      </h3>
      <div className="space-y-3">
        {day.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </section>
  );
}
