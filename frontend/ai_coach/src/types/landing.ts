export interface StatItem {
  value: string;
  label: string;
}

export interface BenefitCard {
  icon: string;
  title: string;
  description: string;
}

export interface StepData {
  number: number;
  title: string;
  description: string;
  details: string[];
  terminalContent: string[];
}

export interface ProgressionBar {
  week: string;
  weightKg: string;
  heightPx: number;
}
