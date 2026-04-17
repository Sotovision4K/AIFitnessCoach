export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  weightKg: number | null;
  rpe: number | null;
  notes?: string;
  previousWeightKg?: number;
}

export interface WorkoutDay {
  dayNumber: number;
  label: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  weekNumber: number;
  status: 'generating' | 'ready' | 'error';
  createdAt: string;
  days: WorkoutDay[];
}
