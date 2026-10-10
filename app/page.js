// Landing page root component: hosts the full-screen canvas background and scroll-driven section content.
// Structured to allow fixed WebGL rendering beneath normal document scroll flow.

"use client";

import { useEffect } from "react";
import Scene from "@/components/Scene";
import SectionCounter from "@/components/SectionCounter";
import GraffitiTags from "@/components/GraffitiTags";
import Headline from "@/components/Headline";
import { initScrollStore, useScrollStore } from "@/store/scroll";
import { SECTIONS, getLocalProgress } from "@/lib/sections";

function SectionHeadlines() {
  const progress = useScrollStore((state) => state.progress);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "540px",
        minHeight: "220px",
      }}
    >
      {SECTIONS.map((section, idx) => {
        const localProgress = getLocalProgress(progress, idx);
        return (
          <Headline
            key={section.index}
            section={section}
            localProgress={localProgress}
            isFirst={idx === 0}
            isLast={idx === SECTIONS.length - 1}
          />
        );
      })}
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const cleanup = initScrollStore();
    return cleanup;
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SectionCounter />
      <Scene />
      <GraffitiTags />

      {/* 600vh scroll container divided into section ranges */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "600vh",
        }}
      >
        {/* Sticky viewport container anchoring text in the lower-left third */}
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "var(--page-margin)",
            pointerEvents: "none",
          }}
        >
          <SectionHeadlines />
        </main>
      </div>
    </>
  );
}
