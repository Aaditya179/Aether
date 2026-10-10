// Landing page root component: hosts the full-screen canvas background and scroll-driven section content.
// Structured to allow fixed WebGL rendering beneath normal document scroll flow.

import Scene from "@/components/Scene";

export default function Home() {
  return (
    <>
      <Scene />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "48px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-base, #0b0b0c)",
            border: "1px solid var(--color-glow, #22e4ff)",
            padding: "24px 32px",
            maxWidth: "520px",
            pointerEvents: "auto",
          }}
        >
          {/* PLACEHOLDER COPY */}
          <h1
            style={{
              fontFamily: "var(--font-anton), sans-serif",
              fontSize: "clamp(48px, 8vw, 100px)",
              lineHeight: 0.9,
              letterSpacing: "0.01em",
              color: "var(--color-text, #f5f5f5)",
              textTransform: "uppercase",
            }}
          >
            TAG GRID
          </h1>
          <p
            style={{
              fontFamily: "var(--font-space-mono), monospace",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "var(--color-text, #f5f5f5)",
              marginTop: "16px",
            }}
          >
            Scroll to draw the line.
          </p>
        </div>
      </main>
    </>
  );
}
