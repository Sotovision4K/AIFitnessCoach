import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import { EQUIPMENT_OPTIONS, INJURY_OPTIONS } from '@/constants/data';
import type { EquipmentAndLimitations } from '@/types/onboarding';

const GYM_ACCESS_TYPES = [
  {
    value: 'full_gym' as const,
    label: 'Full Gym',
    desc: 'Access to all equipment',
  },
  {
    value: 'home_gym' as const,
    label: 'Home Gym',
    desc: 'Select what you have',
  },
  {
    value: 'custom' as const,
    label: 'Custom',
    desc: 'Pick specific equipment',
  },
] as const;

const FULL_GYM_EQUIPMENT = EQUIPMENT_OPTIONS;

const equipmentSchema = z
  .object({
    gymAccessType: z.enum(['full_gym', 'home_gym', 'custom'], { required_error: 'Select an access type' }),
    equipment: z.array(z.string()),
    includeAbs: z.boolean(),
    injuries: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.gymAccessType !== 'full_gym' && data.equipment.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one piece of equipment',
        path: ['equipment'],
      });
    }
  });

type FormValues = z.infer<typeof equipmentSchema>;

interface EquipmentStepProps {
  defaultValues?: Partial<EquipmentAndLimitations>;
  onNext: (data: EquipmentAndLimitations) => void;
  onBack: () => void;
}

export function EquipmentStep({ defaultValues, onNext, onBack }: EquipmentStepProps) {
  const { setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      gymAccessType: defaultValues?.gymAccessType ?? 'full_gym',
      equipment: defaultValues?.equipment ?? [],
      includeAbs: defaultValues?.includeAbs ?? false,
      injuries: defaultValues?.injuries ?? [],
    },
  });

  const gymAccessType = watch('gymAccessType');
  const selectedEquipment = watch('equipment');
  const selectedInjuries = watch('injuries') ?? [];
  const includeAbs = watch('includeAbs');
  const showEquipmentPicker = gymAccessType === 'home_gym' || gymAccessType === 'custom';

  const toggleItem = (list: string[], item: string, field: 'equipment' | 'injuries') => {
    const next = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    setValue(field, next, { shouldValidate: true });
  };

  const handleFormSubmit = (formData: FormValues) => {
    const equipment = formData.gymAccessType === 'full_gym' ? FULL_GYM_EQUIPMENT : formData.equipment;
    onNext({ ...formData, equipment });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="mx-auto space-y-6" style={{ maxWidth: 480 }}>
      <h2 className="font-heading text-text-primary" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
        EQUIPMENT & LIMITATIONS
      </h2>

      {/* Gym access type */}
      <fieldset>
        <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Gym Access
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {GYM_ACCESS_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={gymAccessType === opt.value}
              onClick={() => setValue('gymAccessType', opt.value, { shouldValidate: true })}
              className={cn(
                'flex flex-col items-center rounded-lg border bg-bg-card p-4 transition-colors cursor-pointer',
                gymAccessType === opt.value ? 'border-primary text-primary' : 'border-border-accent text-text-secondary',
              )}
            >
              <span className="font-heading" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{opt.label}</span>
              <span className="mt-1 text-text-dim text-center" style={{ fontSize: '0.65rem' }}>{opt.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Custom equipment picker */}
      {showEquipmentPicker && (
        <fieldset>
          <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
            Available Equipment
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                type="button"
                role="checkbox"
                aria-checked={selectedEquipment.includes(eq)}
                onClick={() => toggleItem(selectedEquipment, eq, 'equipment')}
                className={cn(
                  'rounded-lg border px-4 py-3 text-left font-body transition-colors',
                  selectedEquipment.includes(eq)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-accent bg-bg-card text-text-secondary',
                )}
                style={{ fontSize: '0.85rem' }}
              >
                {selectedEquipment.includes(eq) ? '✓ ' : ''}{eq}
              </button>
            ))}
          </div>
          {errors.equipment && <p className="mt-1 text-danger" style={{ fontSize: '0.8rem' }}>{errors.equipment.message}</p>}
        </fieldset>
      )}

      {/* Include abs */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={includeAbs}
            onChange={(e) => setValue('includeAbs', e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
          <span className="font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
            Include Ab Exercises
          </span>
        </label>
      </div>

      {/* Injuries */}
      <fieldset>
        <legend className="mb-3 font-body uppercase text-text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          Injuries / Limitations <span className="text-text-dim" style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {INJURY_OPTIONS.map((inj) => (
            <button
              key={inj}
              type="button"
              role="checkbox"
              aria-checked={selectedInjuries.includes(inj)}
              onClick={() => toggleItem(selectedInjuries, inj, 'injuries')}
              className={cn(
                'rounded-lg border px-4 py-2 font-body transition-colors',
                selectedInjuries.includes(inj)
                  ? 'border-danger bg-danger/10 text-danger'
                  : 'border-border-accent bg-bg-card text-text-secondary',
              )}
              style={{ fontSize: '0.8rem' }}
            >
              {inj}
            </button>
          ))}
        </div>
      </fieldset>

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

