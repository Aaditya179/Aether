// Fixed full-screen graffiti street tag display that reacts dynamically to scroll progress.
// Renders massive, high-contrast street-bombing letterforms with thick black keyline outlines,
// neon spray halos, and dynamic scroll-driven section transitions.

"use client";

import { useScrollStore } from "@/store/scroll";
import { getLocalProgress } from "@/lib/sections";

const GRAFFITI_TAGS = [
  { tag: "TAG GRID", sub: "/// BOMB THE WALL 00", color: "#D7FF3A", glow: "#FF2E88" },
  { tag: "RAW FORM", sub: "/// STENCIL EDGE 01", color: "#FF2E88", glow: "#00F5FF" },
  { tag: "SIGNAL 02", sub: "/// MULTIPLY PULSE", color: "#00F5FF", glow: "#D7FF3A" },
  { tag: "HEAT EDGE", sub: "/// OVERDRIVE GLOW", color: "#FF2E88", glow: "#00F5FF" },
  { tag: "STREET GRID", sub: "/// SURFACE CHAOS", color: "#D7FF3A", glow: "#00F5FF" },
];

export default function GraffitiTags() {
  const sectionIndex = useScrollStore((state) => state.sectionIndex);
  const progress = useScrollStore((state) => state.progress);

  const activeIndex = Math.min(Math.max(sectionIndex, 0), GRAFFITI_TAGS.length - 1);
  const currentTag = GRAFFITI_TAGS[activeIndex];
  const localProg = getLocalProgress(progress, activeIndex);

  // Entrance and exit fade per section
  const fadeIn = Math.min(localProg / 0.12, 1.0);
  const fadeOut = Math.min((1.0 - localProg) / 0.12, 1.0);
  const opacity = Math.max(0.15, Math.min(fadeIn, fadeOut));

  // Dynamic scale slam and parallax shift as user scrolls
  const scalePunch = 1.0 + (1.0 - fadeIn) * 0.12;
  const parallaxY = (localProg - 0.5) * -40; // subtle vertical float

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: "clamp(24px, 6vw, 80px)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          marginTop: "clamp(40px, 8vh, 100px)",
          marginRight: "clamp(0px, 2vw, 40px)",
          transform: `rotate(-6deg) scale(${scalePunch}) translateY(${parallaxY}px)`,
          transition: "transform 0.1s ease-out",
          opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          userSelect: "none",
        }}
      >
        {/* Massive high-contrast street-bombing graffiti tag */}
        <div
          style={{
            fontFamily: "var(--font-anton), Impact, sans-serif",
            fontSize: "clamp(68px, 13vw, 180px)",
            lineHeight: 0.82,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: currentTag.color,
            WebkitTextStroke: "5px #0B0B0C",
            paintOrder: "stroke fill",
            textShadow: `
              0 0 50px ${currentTag.glow},
              0 0 25px ${currentTag.glow},
              5px 5px 0 #0B0B0C,
              -5px -5px 0 #0B0B0C,
              5px -5px 0 #0B0B0C,
              -5px 5px 0 #0B0B0C,
              0 6px 0 #0B0B0C,
              0 -6px 0 #0B0B0C,
              6px 0 0 #0B0B0C,
              -6px 0 0 #0B0B0C,
              0 24px 45px rgba(0, 0, 0, 0.95)
            `,
            textAlign: "right",
          }}
        >
          {currentTag.tag}
        </div>

        {/* Street stencil sub-label with neon background bar */}
        <div
          style={{
            marginTop: "16px",
            fontFamily: "var(--font-space-mono), monospace",
            fontSize: "clamp(11px, 1.1vw, 15px)",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#0B0B0C",
            backgroundColor: currentTag.glow,
            padding: "4px 12px",
            border: "2px solid #0B0B0C",
            boxShadow: `0 0 20px ${currentTag.glow}, 4px 4px 0 #0B0B0C`,
            alignSelf: "flex-end",
          }}
        >
          {currentTag.sub}
        </div>
      </div>
    </div>
  );
}
