import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Benefits } from '@/components/landing/Benefits';
import { ProgressionChart } from '@/components/landing/ProgressionChart';
import { CTASection } from '@/components/landing/CTASection';

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <ProgressionChart />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
