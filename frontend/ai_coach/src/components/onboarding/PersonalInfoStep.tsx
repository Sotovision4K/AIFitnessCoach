import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PersonalInfo } from '@/types/onboarding';

const personalInfoSchema = z.object({
  age: z.coerce.number().min(16, 'Must be at least 16').max(80, 'Must be 80 or under'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Select a gender' }),
  heightCm: z.coerce.number().min(120, 'Min 120 cm').max(230, 'Max 230 cm'),
  weightKg: z.coerce.number().min(35, 'Min 35 kg').max(200, 'Max 200 kg'),
});

interface PersonalInfoStepProps {
  defaultValues?: Partial<PersonalInfo>;
  onNext: (data: PersonalInfo) => void;
}

export function PersonalInfoStep({ defaultValues, onNext }: PersonalInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="mx-auto space-y-6" style={{ maxWidth: 480 }}>
      <h2 className="font-heading text-text-primary" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
        PERSONAL INFO
      </h2>

      <div>
        <label className="mb-2 block font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Age
        </label>
        <input
          type="number"
          {...register('age')}
          className="w-full rounded-lg border border-border-accent bg-bg-card px-4 py-3 font-body text-text-primary outline-none transition-colors focus:border-primary"
          style={{ fontSize: '0.95rem' }}
          placeholder="28"
        />
        {errors.age && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.age.message}</p>}
      </div>

      <div>
        <label className="mb-2 block font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Gender
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'other'] as const).map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center justify-center rounded-lg border border-border-accent bg-bg-card px-4 py-3 font-body capitalize text-text-secondary transition-colors has-[:checked]:border-primary has-[:checked]:text-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <input type="radio" value={g} {...register('gender')} className="sr-only" />
              {g}
            </label>
          ))}
        </div>
        {errors.gender && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.gender.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
            Height (cm)
          </label>
          <input
            type="number"
            {...register('heightCm')}
            className="w-full rounded-lg border border-border-accent bg-bg-card px-4 py-3 font-body text-text-primary outline-none transition-colors focus:border-primary"
            style={{ fontSize: '0.95rem' }}
            placeholder="180"
          />
          {errors.heightCm && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.heightCm.message}</p>}
        </div>
        <div>
          <label className="mb-2 block font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            {...register('weightKg')}
            className="w-full rounded-lg border border-border-accent bg-bg-card px-4 py-3 font-body text-text-primary outline-none transition-colors focus:border-primary"
            style={{ fontSize: '0.95rem' }}
            placeholder="82"
          />
          {errors.weightKg && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.weightKg.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="w-full font-heading cursor-pointer border-none uppercase text-bg-dark transition-all hover:-translate-y-0.5"
        style={{ backgroundColor: '#00ff88', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', padding: '14px 0', borderRadius: 6 }}
      >
        Next →
      </button>
    </form>
  );
}
