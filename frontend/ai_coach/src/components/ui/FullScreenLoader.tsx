interface FullScreenLoaderProps {
  message?: string;
}

export function FullScreenLoader({ message = 'LOADING...' }: FullScreenLoaderProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: '#00ff88',
        fontFamily: 'monospace',
        fontSize: '14px',
        letterSpacing: '3px',
      }}
    >
      {message}
    </div>
  );
}
