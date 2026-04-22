export const TOKENS = {
  colors: {
    primary: '#00ff88',
    primaryDim: '#00cc6a',
    primaryGlow: 'rgba(0, 255, 136, 0.15)',
    bgDark: '#0a0a0a',
    bgCard: '#111111',
    bgCardHover: '#161616',
    border: '#1a1a1a',
    borderAccent: '#222222',
    textPrimary: '#f0f0f0',
    textSecondary: '#888888',
    textDim: '#555555',
    warning: '#ffaa00',
    danger: '#ff4444',
  },
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Inter', -apple-system, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  spacing: {
    section: '100px',
    container: '1200px',
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
} as const;
