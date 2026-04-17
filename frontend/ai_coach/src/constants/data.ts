import type { StatItem, BenefitCard, StepData, ProgressionBar } from '@/types/landing';

export const HERO_STATS: StatItem[] = [
  { value: '100%', label: 'Personalized' },
  { value: '∞', label: 'Auto Progression' },
  { value: '24/7', label: 'Always Adapting' },
];

export const HOW_IT_WORKS_STEPS: StepData[] = [
  {
    number: 1,
    title: 'INPUT YOUR NUMBERS',
    description:
      'Tell us about your body, goals, available equipment, and training preferences. The AI needs data to build your protocol.',
    details: [
      'Body metrics (age, height, weight)',
      'Training experience level',
      'Available equipment',
      'Injury history',
    ],
    terminalContent: [
      '// user_input.json',
      '{',
      '  "age": 28,',
      '  "goal": "muscle_gain",',
      '  "level": "intermediate",',
      '  "days": 4,',
      '  "equipment": ["barbell", "dumbbells"]',
      '}',
    ],
  },
  {
    number: 2,
    title: 'AI GENERATES YOUR PLAN',
    description:
      'Our AI engine analyzes your input and generates a fully periodized training program tailored to your goals and constraints.',
    details: [
      'Exercise selection optimized for your goals',
      'Volume and intensity auto-calculated',
      'Split type matched to your schedule',
      'Injury-aware exercise substitutions',
    ],
    terminalContent: [
      '// workout_plan.output',
      '├── Week 3: Upper/Lower Split',
      '│   ├── Day 1: Upper Body A',
      '│   │   ├── Bench Press    4×8  @80kg',
      '│   │   ├── Barbell Row    4×10 @60kg',
      '│   │   └── OHP            3×10 @40kg',
      '│   └── Day 2: Lower Body A',
      '│       ├── Squat          4×6  @100kg',
      '│       └── RDL            3×10 @80kg',
      '└── Status: ready',
    ],
  },
  {
    number: 3,
    title: 'AUTO PROGRESSIVE OVERLOAD',
    description:
      'Every week, the AI adjusts your weights, reps, and volume based on your progression. No guesswork. No plateaus.',
    details: [
      'Automatic weight increments',
      'Rep range progression',
      'Volume adjustments based on recovery',
      'Deload weeks when needed',
    ],
    terminalContent: [
      '// progression.diff',
      '  Bench Press  4×8 @77.5kg  RPE 7',
      '────────── ▼ ──────────',
      '  Bench Press  4×8 @80kg ↑  RPE 8',
      '',
      '  Squat        4×6 @95kg   RPE 8',
      '────────── ▼ ──────────',
      '  Squat        4×6 @100kg ↑ RPE 8',
    ],
  },
];

export const BENEFITS_CARDS: BenefitCard[] = [
  {
    icon: '🧠',
    title: 'AI-PERSONALIZED',
    description:
      'Every rep, set, and exercise is tailored to your unique body, goals, and available equipment.',
  },
  {
    icon: '📈',
    title: 'AUTO PROGRESSION',
    description:
      'Weights and volume increase automatically based on your performance. No manual tracking needed.',
  },
  {
    icon: '⚡',
    title: 'ZERO PLANNING',
    description:
      'Walk into the gym knowing exactly what to do. Your entire week is programmed and ready.',
  },
  {
    icon: '🔄',
    title: 'WEEKLY REFRESH',
    description:
      'Fresh programming every week that builds on your previous performance and adapts to your recovery.',
  },
  {
    icon: '🎯',
    title: 'GOAL-DRIVEN',
    description:
      'Whether you want muscle gain, fat loss, strength, or endurance — the AI optimizes for YOUR goal.',
  },
  {
    icon: '🛡️',
    title: 'INJURY-AWARE',
    description:
      'Flag injuries or limitations and the AI automatically substitutes exercises and adjusts programming.',
  },
];

export const PROGRESSION_BARS: ProgressionBar[] = [
  { week: 'WK 1', weightKg: '70kg', heightPx: 120 },
  { week: 'WK 2', weightKg: '72.5kg', heightPx: 145 },
  { week: 'WK 3', weightKg: '75kg', heightPx: 155 },
  { week: 'WK 4', weightKg: '75kg', heightPx: 175 },
  { week: 'WK 5', weightKg: '77.5kg', heightPx: 200 },
  { week: 'WK 6', weightKg: '77.5kg', heightPx: 215 },
  { week: 'WK 7', weightKg: '80kg', heightPx: 235 },
  { week: 'WK 8', weightKg: '82.5kg', heightPx: 260 },
];

export const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbells',
  'Cables',
  'Machines',
  'Pull-up Bar',
  'Resistance Bands',
  'Kettlebells',
  'EZ Curl Bar',
  'Dip Station',
  'Leg Press',
];

export const INJURY_OPTIONS = [
  'Lower Back',
  'Shoulders',
  'Knees',
  'Wrists',
  'Elbows',
  'Neck',
  'Hips',
  'Ankles',
];
