import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from 'react-oidc-context';
import { api, ApiRequestError } from '@/lib/api';
import type { WorkoutPlan } from '@/types/workout';

const POLL_INTERVAL_MS = 5000;

interface UseWorkoutPlanResult {
  plan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  setPlan: (plan: WorkoutPlan | null) => void;
}

export function useWorkoutPlan(): UseWorkoutPlanResult {
  const auth = useAuth();
  const token = auth.user?.id_token;

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPoll = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchPlan = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const data = await api.get<WorkoutPlan>('/api/v1/workout/latest', token);
      setPlan(data);
      setError(null);

      if (data.status === 'generating') {
        pollRef.current = setTimeout(() => fetchPlan(), POLL_INTERVAL_MS);
      }
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        setPlan(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      }
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPlan(true);
    return () => clearPoll();
  }, [fetchPlan]);

  // When plan is set externally (after generation), start polling if still generating
  const setAndMaybePoll = useCallback((incoming: WorkoutPlan | null) => {
    clearPoll();
    setPlan(incoming);
    if (incoming?.status === 'generating') {
      pollRef.current = setTimeout(() => fetchPlan(), POLL_INTERVAL_MS);
    }
  }, [fetchPlan]);

  return { plan, isLoading, error, setPlan: setAndMaybePoll };
}
