import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavProps {
  weekNumber: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function WeekNav({ weekNumber, onPrevious, onNext, hasPrevious, hasNext }: WeekNavProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="flex items-center justify-center rounded-lg border border-border-accent bg-bg-card text-text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        style={{ width: 40, height: 40 }}
        aria-label="Previous week"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="font-heading text-text-primary" style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>
        WEEK {weekNumber}
      </span>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="flex items-center justify-center rounded-lg border border-border-accent bg-bg-card text-text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        style={{ width: 40, height: 40 }}
        aria-label="Next week"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
