// Section headline and body copy presentation component.
// Positions section typography in the viewport lower third adhering to strict negative space rules.

export default function Headline({ section, localProgress, isFirst, isLast }) {
  let opacity = 0;
  if (localProgress >= 0 && localProgress <= 1) {
    const fadeIn = isFirst ? 1 : Math.min(localProgress / 0.1, 1);
    const fadeOut = isLast ? 1 : Math.min((1 - localProgress) / 0.1, 1);
    opacity = Math.max(0, Math.min(fadeIn, fadeOut));
  }

  const pointerEvents = opacity > 0.05 ? "auto" : "none";

  return (
    <div
      style={{
        opacity,
        pointerEvents,
        backgroundColor: "var(--color-base, #0b0b0c)",
        border: "1px solid var(--color-glow, #22e4ff)",
        padding: "clamp(20px, 3vw, 32px) clamp(24px, 4vw, 40px)",
        maxWidth: "540px",
        width: "100%",
        position: "absolute",
        bottom: 0,
        left: 0,
      }}
    >
      {/* PLACEHOLDER COPY */}
      {isFirst ? (
        <h1
          style={{
            fontFamily: "var(--font-anton), sans-serif",
            fontSize: "clamp(48px, 10vw, 140px)",
            lineHeight: 0.9,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: "var(--color-text, #f5f5f5)",
            margin: 0,
          }}
        >
          {section.headline}
        </h1>
      ) : (
        <h2
          style={{
            fontFamily: "var(--font-anton), sans-serif",
            fontSize: "clamp(36px, 6vw, 84px)",
            lineHeight: 0.95,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: "var(--color-text, #f5f5f5)",
            margin: 0,
          }}
        >
          {section.headline}
        </h2>
      )}
      <p
        style={{
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: "clamp(14px, 1.2vw, 16px)",
          lineHeight: 1.6,
          color: "var(--color-text, #f5f5f5)",
          maxWidth: "56ch",
          marginTop: "16px",
          marginBottom: 0,
        }}
      >
        {section.body}
      </p>
    </div>
  );
}
