export function Scanline() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0, 255, 136, 0.008) 2px, rgba(0, 255, 136, 0.008) 4px)',
      }}
      aria-hidden="true"
    />
  );
}
