import { useState, useCallback } from 'react';
import { api, ApiRequestError } from '@/lib/api';

interface GenerateResponse {
  planId: string;
  status: string;
  message: string;
}

export function GenerateButton() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      await api.post<GenerateResponse>('/api/v1/workout/generate');
      // Reload the page to show the generating status
      window.location.reload();
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        setError('A plan is already being generated.');
      } else {
        setError(err instanceof Error ? err.message : 'Generation failed');
      }
      setGenerating(false);
    }
  }, []);

  return (
    <div className="text-center">
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="font-heading cursor-pointer border-none uppercase text-bg-dark transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: '#00ff88',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '2px',
          padding: '14px 32px',
          borderRadius: 6,
        }}
      >
        {generating ? 'Generating...' : 'Generate New Plan'}
      </button>
      {error && (
        <p className="mt-2 font-mono text-danger" style={{ fontSize: '0.8rem' }}>{error}</p>
      )}
    </div>
  );
}
