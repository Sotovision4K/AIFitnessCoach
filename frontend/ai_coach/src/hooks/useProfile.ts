import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { api, ApiRequestError } from '@/lib/api';
import type { UserProfile } from '@/types/user';

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export function useProfile(): UseProfileResult {
  const auth = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user) {
      setIsLoading(false);
      return;
    }

    const token = auth.user.id_token;

    let cancelled = false;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<UserProfile>('/api/v1/user/get-profile', token);
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : 'Failed to load profile');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.user]);

  return { profile, isLoading, error };
}
