// Fixed section counter indicator showing current scroll section progress.
// Formats the active section (e.g. '01 / 05') using Space Mono typography and polite ARIA announcements.

"use client";

import { useScrollStore } from "@/store/scroll";
import { SECTIONS } from "@/lib/sections";

export default function SectionCounter() {
  const sectionIndex = useScrollStore((state) => state.sectionIndex);
  const totalSections = SECTIONS.length;
  const currentSection = SECTIONS[sectionIndex] || SECTIONS[0];

  const formatted = `${String(sectionIndex + 1).padStart(2, "0")} / ${String(totalSections).padStart(2, "0")}`;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        left: "24px",
        zIndex: 10,
        fontFamily: "var(--font-space-mono), monospace",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        lineHeight: 1.2,
        textTransform: "uppercase",
        color: "var(--color-text, #f5f5f5)",
        backgroundColor: "var(--color-base, #0b0b0c)",
        padding: "6px 12px",
        border: "1px solid var(--color-glow, #22e4ff)",
        pointerEvents: "none",
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <span aria-hidden="true">{formatted}</span>
      <span
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {currentSection.name}
      </span>
    </div>
  );
}
