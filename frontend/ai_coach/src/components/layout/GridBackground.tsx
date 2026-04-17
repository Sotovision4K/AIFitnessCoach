export function GridBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 255, 136, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
      aria-hidden="true"
    />
  );
}
