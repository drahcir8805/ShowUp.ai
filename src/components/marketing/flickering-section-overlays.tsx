/**
 * Layers above the flickering canvas: light yellow gradients, then the warm beige wash.
 * Keeps the grid visible while matching site yellow + beige.
 */
export function FlickeringSectionOverlays() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 95% 75% at 50% -8%, color-mix(in srgb, var(--yellow) 22%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--yellow) 14%, transparent) 0%, transparent 42%, color-mix(in srgb, var(--yellow) 10%, transparent) 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[color-mix(in_srgb,var(--landing-warm)_22%,transparent)]"
      />
    </>
  );
}
