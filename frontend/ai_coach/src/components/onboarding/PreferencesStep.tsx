import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import type { Preferences } from '@/types/onboarding';

// Blocks common prompt-injection patterns while allowing natural fitness language
const safeText = z
  .string()
  .max(300, 'Max 300 characters')
  .refine(
    (val) =>
      !/(\bignore\b|\bforget\b|\bsystem\b|\bprompt\b|<[^>]+>|\[.*?\]|\{.*?\}|```)/i.test(val),
    { message: 'Invalid characters or phrases detected' },
  )
  .optional();

const preferencesSchema = z.object({
  splitType: z.enum(['upper_lower', 'push_pull_legs', 'full_body', 'bro_split'], { required_error: 'Select a split' }),
  cardioIncluded: z.boolean(),
  preferredCardio: z.string().optional(),
  additionalComments: safeText,
});

const SPLITS = [
  { value: 'upper_lower', label: 'Upper / Lower' },
  { value: 'push_pull_legs', label: 'Push / Pull / Legs' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'bro_split', label: 'Bro Split' },
] as const;

interface PreferencesStepProps {
  defaultValues?: Partial<Preferences>;
  onNext: (data: Preferences) => void;
  onBack: () => void;
}

export function PreferencesStep({ defaultValues, onNext, onBack }: PreferencesStepProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Preferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { cardioIncluded: false, ...defaultValues },
  });

  const selectedSplit = watch('splitType');
  const cardioIncluded = watch('cardioIncluded');

  return (
    <form onSubmit={handleSubmit(onNext)} className="mx-auto space-y-6" style={{ maxWidth: 480 }}>
      <h2 className="font-heading text-text-primary" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
        PREFERENCES
      </h2>

      <fieldset>
        <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Split Type
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {SPLITS.map((s) => (
            <label
              key={s.value}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-lg border bg-bg-card p-4 font-heading transition-colors',
                selectedSplit === s.value ? 'border-primary text-primary' : 'border-border-accent text-text-secondary',
              )}
              style={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              <input type="radio" value={s.value} {...register('splitType')} className="sr-only" />
              {s.label}
            </label>
          ))}
        </div>
        {errors.splitType && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.splitType.message}</p>}
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            {...register('cardioIncluded')}
            className="h-5 w-5 accent-primary"
          />
          <span className="font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
            Include Cardio
          </span>
        </label>
      </div>

      {cardioIncluded && (
        <div>
          <label className="mb-2 block font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
            Preferred Cardio (optional)
          </label>
          <input
            type="text"
            {...register('preferredCardio')}
            className="w-full rounded-lg border border-border-accent bg-bg-card px-4 py-3 font-body text-text-primary outline-none transition-colors focus:border-primary"
            style={{ fontSize: '0.95rem' }}
            placeholder="e.g. incline walk, cycling, rowing"
          />
        </div>
      )}

      {/* Additional comments */}
      <div>
        <label className="mb-2 block font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Additional Comments <span className="text-text-dim" style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <textarea
          {...register('additionalComments')}
          rows={3}
          maxLength={300}
          placeholder="e.g. I prefer compound movements, avoid machines, focus on hypertrophy..."
          className={cn(
            'w-full rounded-lg border bg-bg-card px-4 py-3 font-body text-text-primary outline-none transition-colors focus:border-primary resize-none',
            errors.additionalComments ? 'border-danger' : 'border-border-accent',
          )}
          style={{ fontSize: '0.9rem' }}
        />
        {errors.additionalComments && (
          <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.additionalComments.message}</p>
        )}
        <p className="mt-1 text-text-dim" style={{ fontSize: '0.7rem' }}>
          {(watch('additionalComments') ?? '').length} / 300
        </p>
      </div>

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
