
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate, useLocation } from 'react-router';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useProfile } from '@/hooks/useProfile';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, isLoading: profileLoading } = useProfile();

    // All hooks must be declared before any conditional returns
    useEffect(() => {
        if (!auth.isAuthenticated || !profile) return;

        const onDashboard = location.pathname.startsWith('/dashboard');
        const onOnboarding = location.pathname.startsWith('/onboarding');

        if (!profile.onboardingComplete && onDashboard) {
            navigate('/onboarding', { replace: true });
        } else if (profile.onboardingComplete && onOnboarding) {
            navigate('/dashboard', { replace: true });
        }
    }, [auth.isAuthenticated, profile, location.pathname, navigate]);

    if (auth.isLoading) {
        return <FullScreenLoader message="VERIFYING ACCESS..." />;
    }

    if (auth.error) {
        navigate('/', { replace: true });
        return null;
    }

    if (!auth.isAuthenticated) {
        auth.signinRedirect();
        return null;
    }

    if (profileLoading) {
        return <FullScreenLoader message="LOADING PROFILE..." />;
    }

    return <>{children}</>;
}
