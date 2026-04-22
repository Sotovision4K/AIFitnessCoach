import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import type { FitnessProfile } from '@/types/onboarding';

const positiveOrUndefined = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
  z.number().positive('Must be greater than 0').optional(),
);

const fitnessProfileSchema = z
  .object({
    fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], { required_error: 'Select a level' }),
    goal: z.enum(['muscle_gain', 'fat_loss', 'strength', 'endurance'], { required_error: 'Select a goal' }),
    daysPerWeek: z.coerce.number().min(2).max(6),
    sessionDurationMin: z.coerce.number().refine((v): v is 30 | 45 | 60 | 75 | 90 => [30, 45, 60, 75, 90].includes(v)),
    deadliftKg: positiveOrUndefined,
    squatKg: positiveOrUndefined,
    benchPressKg: positiveOrUndefined,
  })
  .superRefine((data, ctx) => {
    if (data.fitnessLevel !== 'beginner') {
      if (data.deadliftKg == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required', path: ['deadliftKg'] });
      }
      if (data.squatKg == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required', path: ['squatKg'] });
      }
      if (data.benchPressKg == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required', path: ['benchPressKg'] });
      }
    }
  });

type FormValues = z.infer<typeof fitnessProfileSchema>;

const LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: '< 1 year training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1-3 years training' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years training' },
] as const;

const GOALS = [
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
  { value: 'fat_loss', label: 'Fat Loss', icon: '🔥' },
  { value: 'strength', label: 'Strength', icon: '🏋️' },
  { value: 'endurance', label: 'Endurance', icon: '🏃' },
] as const;

const DURATIONS = [30, 45, 60, 75, 90] as const;

interface FitnessProfileStepProps {
  defaultValues?: Partial<FitnessProfile>;
  onNext: (data: FitnessProfile) => void;
  onBack: () => void;
}

export function FitnessProfileStep({ defaultValues, onNext, onBack }: FitnessProfileStepProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(fitnessProfileSchema),
    defaultValues: {
      daysPerWeek: defaultValues?.daysPerWeek ?? 4,
      deadliftKg: defaultValues?.oneRepMax?.deadliftKg,
      squatKg: defaultValues?.oneRepMax?.squatKg,
      benchPressKg: defaultValues?.oneRepMax?.benchPressKg,
      ...defaultValues,
    },
  });

  const selectedLevel = watch('fitnessLevel');
  const selectedGoal = watch('goal');
  const selectedDuration = watch('sessionDurationMin');
  const showOneRepMax = selectedLevel && selectedLevel !== 'beginner';

  useEffect(() => {
    if (selectedLevel === 'beginner') {
      setValue('deadliftKg', undefined);
      setValue('squatKg', undefined);
      setValue('benchPressKg', undefined);
    }
  }, [selectedLevel, setValue]);

  const handleFormSubmit = (formData: FormValues) => {
    const profile: FitnessProfile = {
      fitnessLevel: formData.fitnessLevel,
      goal: formData.goal,
      daysPerWeek: formData.daysPerWeek,
      sessionDurationMin: formData.sessionDurationMin,
      oneRepMax:
        formData.fitnessLevel !== 'beginner' && formData.deadliftKg && formData.squatKg && formData.benchPressKg
          ? { deadliftKg: formData.deadliftKg, squatKg: formData.squatKg, benchPressKg: formData.benchPressKg }
          : undefined,
    };
    onNext(profile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="mx-auto space-y-6" style={{ maxWidth: 480 }}>
      <h2 className="font-heading text-text-primary" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
        FITNESS PROFILE
      </h2>

      {/* Level cards */}
      <fieldset>
        <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Experience Level
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((l) => (
            <label
              key={l.value}
              className={cn(
                'flex cursor-pointer flex-col items-center rounded-lg border bg-bg-card p-4 transition-colors',
                selectedLevel === l.value ? 'border-primary text-primary' : 'border-border-accent text-text-secondary',
              )}
            >
              <input type="radio" value={l.value} {...register('fitnessLevel')} className="sr-only" />
              <span className="font-heading" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{l.label}</span>
              <span className="mt-1 text-text-dim" style={{ fontSize: '0.65rem' }}>{l.desc}</span>
            </label>
          ))}
        </div>
        {errors.fitnessLevel && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.fitnessLevel.message}</p>}
      </fieldset>

      {/* Goal cards */}
      <fieldset>
        <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Primary Goal
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((g) => (
            <label
              key={g.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border bg-bg-card p-4 transition-colors',
                selectedGoal === g.value ? 'border-primary text-primary' : 'border-border-accent text-text-secondary',
              )}
            >
              <input type="radio" value={g.value} {...register('goal')} className="sr-only" />
              <span>{g.icon}</span>
              <span className="font-heading" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{g.label}</span>
            </label>
          ))}
        </div>
        {errors.goal && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.goal.message}</p>}
      </fieldset>

      {/* Days per week */}
      <div>
        <label className="mb-2 block font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Days per Week: <span className="text-primary">{watch('daysPerWeek')}</span>
        </label>
        <input
          type="range"
          min={2}
          max={6}
          {...register('daysPerWeek')}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-text-dim" style={{ fontSize: '0.7rem' }}>
          <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
        </div>
      </div>

      {/* Duration segmented control */}
      <fieldset>
        <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Session Duration
        </legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Session duration">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={selectedDuration === d}
              onClick={() => setValue('sessionDurationMin', d)}
              className={cn(
                'flex-1 rounded-lg border py-2 font-heading transition-colors',
                selectedDuration === d ? 'border-primary bg-primary text-bg-dark' : 'border-border-accent bg-bg-card text-text-secondary',
              )}
              style={{ fontSize: '0.7rem', fontWeight: 700 }}
            >
              {d}m
            </button>
          ))}
        </div>
        <input type="hidden" {...register('sessionDurationMin')} />
      </fieldset>

      {/* One Rep Max */}
      {showOneRepMax && (
        <fieldset>
          <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
            One Rep Max <span className="text-text-dim" style={{ textTransform: 'none', letterSpacing: 0 }}>(kg)</span>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {[
              { field: 'deadliftKg' as const, label: 'Deadlift' },
              { field: 'squatKg' as const, label: 'Squat' },
              { field: 'benchPressKg' as const, label: 'Bench Press' },
            ].map(({ field, label }) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="font-heading text-text-secondary" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>
                  {label}
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="kg"
                  {...register(field)}
                  className={cn(
                    'rounded-lg border bg-bg-card px-3 py-2 font-mono text-text-primary outline-none transition-colors focus:border-primary',
                    errors[field] ? 'border-danger' : 'border-border-accent',
                  )}
                  style={{ fontSize: '0.85rem' }}
                />
                {errors[field] && (
                  <p className="text-danger" style={{ fontSize: '0.7rem' }}>{errors[field]?.message}</p>
                )}
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 cursor-pointer rounded-lg border border-border-accent bg-transparent py-3 font-heading uppercase text-text-secondary transition-colors hover:text-primary"
          style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px' }}
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 font-heading cursor-pointer border-none uppercase text-bg-dark transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: '#00ff88', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', padding: '14px 0', borderRadius: 6 }}
        >
          Next →
        </button>
      </div>
    </form>
  );
}
