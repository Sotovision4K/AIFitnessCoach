import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { PersonalInfoStep } from '@/components/onboarding/PersonalInfoStep';
import { FitnessProfileStep } from '@/components/onboarding/FitnessProfileStep';
import { EquipmentStep } from '@/components/onboarding/EquipmentStep';
import { PreferencesStep } from '@/components/onboarding/PreferencesStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';

const STEP_LABELS = ['Personal', 'Fitness', 'Equipment', 'Preferences', 'Review'];

export function OnboardingPage() {
  const navigate = useNavigate();
  const form = useMultiStepForm();

  const handleSubmit = useCallback(async () => {
    const success = await form.submit();
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  }, [form, navigate]);

  const fullInput = form.getFullInput();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-dark" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
          <StepProgress
            currentStep={form.step + 1}
            totalSteps={5}
            labels={STEP_LABELS}
          />

          <div className="mt-12">
            {form.step === 0 && (
              <PersonalInfoStep
                defaultValues={form.data.personalInfo ?? undefined}
                onNext={form.savePersonalInfo}
              />
            )}
            {form.step === 1 && (
              <FitnessProfileStep
                defaultValues={form.data.fitnessProfile ?? undefined}
                onNext={form.saveFitnessProfile}
                onBack={form.back}
              />
            )}
            {form.step === 2 && (
              <EquipmentStep
                defaultValues={form.data.equipment ?? undefined}
                onNext={form.saveEquipment}
                onBack={form.back}
              />
            )}
            {form.step === 3 && (
              <PreferencesStep
                defaultValues={form.data.preferences ?? undefined}
                onNext={form.savePreferences}
                onBack={form.back}
              />
            )}
            {form.step === 4 && fullInput && (
              <ReviewStep
                data={fullInput}
                onBack={form.back}
                onEdit={form.goTo}
                onSubmit={handleSubmit}
                isSubmitting={form.isSubmitting}
              />
            )}
          </div>

          {form.error && (
            <p className="mt-4 text-center font-mono text-danger" style={{ fontSize: '0.8rem' }} role="alert" aria-live="polite">
              {form.error}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
