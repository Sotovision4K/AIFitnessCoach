export interface PersonalInfo {
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
}

export interface FitnessProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance';
  daysPerWeek: number;
  sessionDurationMin: 30 | 45 | 60 | 75 | 90;
  oneRepMax?: {
    deadliftKg: number;
    squatKg: number;
    benchPressKg: number;
  };
}

export interface EquipmentAndLimitations {
  gymAccessType: 'full_gym' | 'home_gym' | 'custom';
  equipment: string[];
  includeAbs: boolean;
  injuries?: string[];
}

export interface Preferences {
  splitType: 'upper_lower' | 'push_pull_legs' | 'full_body' | 'bro_split';
  cardioIncluded: boolean;
  preferredCardio?: string;
  additionalComments?: string;
}

export interface OnboardingInput {
  personalInfo: PersonalInfo;
  fitnessProfile: FitnessProfile;
  equipment: EquipmentAndLimitations;
  preferences: Preferences;
}
