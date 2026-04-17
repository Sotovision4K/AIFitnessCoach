import { useState, useEffect } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { DayView } from './DayView';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import type { WorkoutPlan } from '@/types/workout';

export function WorkoutPlanView() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await api.get<WorkoutPlan>('/api/v1/workout/latest');
        setPlan(data);
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) {
          setPlan(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load plan');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  if (loading) {
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
      <div className="rounded-lg border border-border-accent bg-bg-card p-8 text-center">
        <p className="font-mono text-text-dim" style={{ fontSize: '0.85rem' }}>
          {'// no_plan_found'}
        </p>
        <p className="mt-4 font-body text-text-secondary">
          Generate your first workout plan to get started.
        </p>
      </div>
    );
  }

  if (plan.status === 'generating') {
    return (
      <div className="rounded-lg border border-border-accent bg-bg-card p-8 text-center">
        <span className="font-mono text-primary" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>
          {'> '}GENERATING PLAN<span style={{ animation: 'blink 1s infinite' }}>_</span>
        </span>
        <p className="mt-4 font-body text-text-secondary">
          Your AI coach is building your program. This may take a moment.
        </p>
      </div>
    );
  }

  if (plan.status === 'error') {
    return (
      <div className="rounded-lg border border-danger/30 bg-bg-card p-8 text-center">
        <p className="font-mono text-danger" style={{ fontSize: '0.85rem' }}>// generation_failed</p>
        <p className="mt-4 font-body text-text-secondary">
          Something went wrong generating your plan. Try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {plan.days.map((day) => (
        <DayView key={day.dayNumber} day={day} />
      ))}
    </div>
  );
}
