
import { useAuth } from "react-oidc-context"

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuth();


    if (auth.isLoading) {
        return <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a',
                color: '#00ff88',
                fontFamily: 'monospace',
                fontSize: '14px',
                letterSpacing: '3px',
            }}>
                VERIFYING ACCESS...
            </div>
    }

    if (auth.error) {
        throw new Error("Redirect to home or login page on error");
    }

    if (!auth.isAuthenticated) {
        auth.signinRedirect();
        return null; // or a loading spinner
    }

    return <>{children}</>;
}