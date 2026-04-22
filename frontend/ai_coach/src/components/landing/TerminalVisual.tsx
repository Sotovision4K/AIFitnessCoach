export function TerminalVisual({ lines, label }: { lines: string[]; label: string }) {
  return (
    <div
      className="rounded-lg border border-border-accent bg-bg-card"
      style={{ padding: 24 }}
    >
      <p className="mb-3 font-mono text-text-dim" style={{ fontSize: '0.65rem' }}>
        {label}
      </p>
      <pre className="m-0 font-mono" style={{ fontSize: '0.8rem', lineHeight: 1.7 }}>
        {lines.map((line, i) => {
          if (line.includes('▼') || line.includes('──')) {
            return (
              <span key={i} className="block text-text-dim">
                {line}
              </span>
            );
          }
          if (line.includes('↑')) {
            return (
              <span key={i} className="block text-primary">
                {line}
              </span>
            );
          }
          const parts = line.split(/(".*?")/g);
          return (
            <span key={i} className="block">
              {parts.map((part, j) =>
                part.startsWith('"') ? (
                  <span key={j} className="text-warning">
                    {part}
                  </span>
                ) : (
                  <span
                    key={j}
                    className={
                      /\d/.test(part) && !line.startsWith('//')
                        ? 'text-primary'
                        : 'text-text-dim'
                    }
                  >
                    {part}
                  </span>
                ),
              )}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
