import { useState } from 'react';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseDetailPanel } from './ExerciseDetailPanel';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import type { WorkoutPlan, Exercise } from '@/types/workout';

const SURFACE = '#1a1a2e';
const SURFACE_LIGHT = '#16213e';
const DIM = '#8892b0';

interface WorkoutPlanViewProps {
  plan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
}

export function WorkoutPlanView({ plan, isLoading, error }: WorkoutPlanViewProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="font-mono text-danger" style={{ fontSize: '0.85rem' }}>// error</p>
        <p className="mt-2 font-body text-text-secondary">{error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div
        style={{ backgroundColor: SURFACE, border: '1px solid #2a2a3e', borderRadius: 16, padding: '32px', textAlign: 'center' }}
      >
        <p className="font-mono text-text-dim" style={{ fontSize: '0.85rem' }}>{'// no_plan_found'}</p>
        <p className="mt-4 font-body text-text-secondary">Generate your first workout plan to get started.</p>
      </div>
    );
  }

  if (plan.status === 'generating') {
    return (
      <div style={{ backgroundColor: SURFACE, border: '1px solid #2a2a3e', borderRadius: 16, padding: '32px', textAlign: 'center' }}>
        <span className="font-mono text-primary" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>
          {'> '}GENERATING PLAN<span style={{ animation: 'blink 1s infinite' }}>_</span>
        </span>
        <p className="mt-4 font-body text-text-secondary">Your AI coach is building your program. This may take a moment.</p>
      </div>
    );
  }

  if (plan.status === 'error') {
    return (
      <div style={{ backgroundColor: SURFACE, border: '1px solid #ff44444d', borderRadius: 16, padding: '32px', textAlign: 'center' }}>
        <p className="font-mono text-danger" style={{ fontSize: '0.85rem' }}>// generation_failed</p>
        <p className="mt-4 font-body text-text-secondary">Something went wrong generating your plan. Try again.</p>
      </div>
    );
  }

  const days = plan.days;
  const currentDay = days[currentDayIndex];

  if (!currentDay) return null;

  return (
    <>
      {/* Day tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {days.map((day, idx) => {
          const isActive = idx === currentDayIndex;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setCurrentDayIndex(idx)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                padding: '10px 20px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ...(isActive
                  ? {
                      background: 'linear-gradient(135deg, #00e676 0%, #00c853 100%)',
                      color: '#0a0a0f',
                      fontWeight: 700,
                    }
                  : {
                      backgroundColor: SURFACE,
                      color: DIM,
                      fontWeight: 500,
                    }),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = SURFACE_LIGHT;
                  (e.currentTarget as HTMLButtonElement).style.color = '#ccd6f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = SURFACE;
                  (e.currentTarget as HTMLButtonElement).style.color = DIM;
                }
              }}
            >
              Day {day.dayNumber}: {day.label}
            </button>
          );
        })}
      </div>

      {/* Session summary bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px 24px',
          backgroundColor: SURFACE,
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 32,
          border: '1px solid #2a2a3e',
        }}
      >
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#f0f0f0', fontSize: '0.9rem' }}>
          Day {currentDay.dayNumber} — {currentDay.label}
        </span>
        <span style={{ color: DIM }}>|</span>
        <span style={{ fontSize: '0.85rem', color: DIM }}>
          Exercises: <span style={{ color: '#f0f0f0', fontWeight: 600 }}>{currentDay.exercises.length}</span>
        </span>
      </div>

      {/* Exercise card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {currentDay.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onClick={setSelectedExercise}
          />
        ))}
      </div>

      {/* Detail slide panel */}
      <ExerciseDetailPanel
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </>
  );
}
