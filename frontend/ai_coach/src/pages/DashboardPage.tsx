import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WeekNav } from '@/components/dashboard/WeekNav';
import { WorkoutPlanView } from '@/components/dashboard/WorkoutPlanView';
import { GenerateButton } from '@/components/dashboard/GenerateButton';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';

export function DashboardPage() {
  const { plan, isLoading, error, setPlan } = useWorkoutPlan();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-dark" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-primary" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>
                {'// dashboard'}
              </p>
              <h1 className="mt-1 font-heading text-text-primary" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
                Your Training Protocol
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <WeekNav weekNumber={plan?.weekNumber ?? 1} hasPrevious={false} hasNext={false} />
            </div>
          </div>

          <WorkoutPlanView plan={plan} isLoading={isLoading} error={error} />

          <div className="mt-12">
            <GenerateButton onGenerated={setPlan} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
