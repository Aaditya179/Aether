// Fallback background view displayed when WebGL 2 or Canvas context fails to initialize.
// Preserves readable typography and site navigation without throwing fatal graphics errors.

export default function Fallback() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundColor: "var(--color-base, #0b0b0c)",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
