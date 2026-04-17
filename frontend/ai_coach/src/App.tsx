import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { GridBackground } from '@/components/layout/GridBackground';
import { Scanline } from '@/components/layout/Scanline';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CognitoAuthProvider } from '@/lib/auth-config';
import { ProtectedRoute } from './components/auth/protectedRoute';

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const OnboardingPage = lazy(() =>
  import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark">
      <div
        className="font-mono text-primary"
        style={{ fontSize: '0.85rem', letterSpacing: '2px' }}
      >
        {'> '}LOADING
        <span style={{ animation: 'blink 1s infinite' }}>_</span>
      </div>
    </div>
  );
}

function RootLayout() {
  return (
    <>
      <GridBackground />
      <Scanline />
      <div className="relative z-10">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/onboarding', element: 
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute> },
      { path: '/dashboard', element: 
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return (
    <ErrorBoundary>
      <CognitoAuthProvider>
        <RouterProvider router={router} />
      </CognitoAuthProvider>
    </ErrorBoundary>
  );
}
