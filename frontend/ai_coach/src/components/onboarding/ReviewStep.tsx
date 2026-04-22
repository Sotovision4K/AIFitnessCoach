import type { OnboardingInput } from '@/types/onboarding';

interface ReviewStepProps {
  data: OnboardingInput;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function Section({
  title,
  stepIndex,
  onEdit,
  children,
}: {
  title: string;
  stepIndex: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-accent bg-bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading uppercase text-text-secondary" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="font-mono text-primary transition-opacity hover:opacity-80"
          style={{ fontSize: '0.7rem', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          edit
        </button>
      </div>
      <pre className="mt-2 font-mono text-text-primary" style={{ fontSize: '0.8rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {children}
      </pre>
    </div>
  );
}

export function ReviewStep({ data, onBack, onEdit, onSubmit, isSubmitting }: ReviewStepProps) {
  return (
    <div className="mx-auto space-y-4" style={{ maxWidth: 480 }}>
      <h2 className="font-heading text-text-primary" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
        REVIEW
      </h2>

      <Section title="// personal_info" stepIndex={0} onEdit={onEdit}>
        {`age: ${data.personalInfo.age}\ngender: ${data.personalInfo.gender}\nheight: ${data.personalInfo.heightCm} cm\nweight: ${data.personalInfo.weightKg} kg`}
      </Section>

      <Section title="// fitness_profile" stepIndex={1} onEdit={onEdit}>
        {`level: ${data.fitnessProfile.fitnessLevel}\ngoal: ${data.fitnessProfile.goal}\ndays/week: ${data.fitnessProfile.daysPerWeek}\nduration: ${data.fitnessProfile.sessionDurationMin} min${data.fitnessProfile.oneRepMax ? `\n1RM deadlift: ${data.fitnessProfile.oneRepMax.deadliftKg} kg\n1RM squat: ${data.fitnessProfile.oneRepMax.squatKg} kg\n1RM bench: ${data.fitnessProfile.oneRepMax.benchPressKg} kg` : ''}`}
      </Section>

      <Section title="// equipment" stepIndex={2} onEdit={onEdit}>
        {`gym access: ${data.equipment.gymAccessType}\nequipment: [${data.equipment.equipment.join(', ')}]\ninclude abs: ${data.equipment.includeAbs}${data.equipment.injuries?.length ? `\ninjuries: [${data.equipment.injuries.join(', ')}]` : ''}`}
      </Section>

      <Section title="// preferences" stepIndex={3} onEdit={onEdit}>
        {`split: ${data.preferences.splitType}\ncardio: ${data.preferences.cardioIncluded}${data.preferences.preferredCardio ? `\npreferred: ${data.preferences.preferredCardio}` : ''}${data.preferences.additionalComments ? `\ncomments: ${data.preferences.additionalComments}` : ''}`}
      </Section>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 cursor-pointer rounded-lg border border-border-accent bg-transparent py-3 font-heading uppercase text-text-secondary transition-colors hover:text-primary"
          style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px' }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 font-heading cursor-pointer border-none uppercase text-bg-dark transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: '#00ff88', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', padding: '14px 0', borderRadius: 6 }}
        >
          {isSubmitting ? 'Submitting...' : 'Generate My Plan →'}
        </button>
      </div>
    </div>
  );
}
