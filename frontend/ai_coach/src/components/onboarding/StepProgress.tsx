import { cn } from '@/lib/cn';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  return (
    <nav className="mx-auto" style={{ maxWidth: 600 }} aria-label="Form progress">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={stepNum} className="flex flex-1 items-center">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center font-heading transition-all',
                    (isActive || isCompleted) ? 'text-bg-dark' : 'text-text-dim',
                  )}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: isActive || isCompleted ? 'none' : '2px solid #222',
                    backgroundColor: isActive || isCompleted ? '#00ff88' : 'transparent',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span
                  className="mt-2 hidden font-body text-center uppercase sm:block"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '1px',
                    color: isActive ? '#00ff88' : '#555',
                    maxWidth: 80,
                  }}
                >
                  {labels[i]}
                </span>
              </div>

              {/* Connecting line */}
              {stepNum < totalSteps && (
                <div
                  className="mx-2 h-px flex-1"
                  style={{
                    backgroundColor: isCompleted ? '#00ff88' : '#222',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
