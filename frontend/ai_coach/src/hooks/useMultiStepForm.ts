import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type {
  OnboardingInput,
  PersonalInfo,
  FitnessProfile,
  EquipmentAndLimitations,
  Preferences,
} from '@/types/onboarding';
import { useAuth } from 'react-oidc-context';

export function useMultiStepForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [equipment, setEquipment] = useState<EquipmentAndLimitations | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);

  const auth = useAuth(); 

  const next = useCallback(() => setStep((s) => Math.min(s + 1, 4)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const goTo = useCallback((s: number) => setStep(s), []);

  const savePersonalInfo = useCallback((data: PersonalInfo) => {
    setPersonalInfo(data);
    next();
  }, [next]);

  const saveFitnessProfile = useCallback((data: FitnessProfile) => {
    setFitnessProfile(data);
    next();
  }, [next]);

  const saveEquipment = useCallback((data: EquipmentAndLimitations) => {
    setEquipment(data);
    next();
  }, [next]);

  const savePreferences = useCallback((data: Preferences) => {
    setPreferences(data);
    next();
  }, [next]);

  const getFullInput = useCallback((): OnboardingInput | null => {
    if (!personalInfo || !fitnessProfile || !equipment || !preferences) return null;
    return { personalInfo, fitnessProfile, equipment, preferences };
  }, [personalInfo, fitnessProfile, equipment, preferences]);

  const submit = useCallback(async (): Promise<boolean> => {
    const input = getFullInput();
    if (!input) return false;

    setIsSubmitting(true);
    setError(null);
    const unpacked_input = { ...input.personalInfo, ...input.fitnessProfile, ...input.fitnessProfile.oneRepMax, ...input.equipment, ...input.preferences };
    try {
      await api.put('/api/v1/user/profile/', unpacked_input, auth?.user?.access_token);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [getFullInput, auth?.user?.access_token]);

  return {
    step,
    next,
    back,
    goTo,
    savePersonalInfo,
    saveFitnessProfile,
    saveEquipment,
    savePreferences,
    submit,
    isSubmitting,
    error,
    data: { personalInfo, fitnessProfile, equipment, preferences },
    getFullInput,
  };
}
