// Landing page root component: hosts the full-screen canvas background and scroll-driven section content.
// Structured to allow fixed WebGL rendering beneath normal document scroll flow.

import Scene from "@/components/Scene";

export default function Home() {
  return (
    <>
      <Scene />
      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "48px" }}>
        {/* PLACEHOLDER COPY */}
        <h1 style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(48px, 8vw, 120px)" }}>
          TAG GRID
        </h1>
        <p style={{ fontFamily: "var(--font-space-mono), monospace", marginTop: "16px" }}>
          Scroll to draw the line.
        </p>
      </main>
    </>
  );
}
