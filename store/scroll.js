// Central Zustand state store managing normalized scroll progress and derived section indexes.
// Decouples scroll listeners from high-frequency React re-renders across the application.

import { create } from "zustand";
import { getSectionIndex } from "@/lib/sections";

export const useScrollStore = create((set, get) => ({
  progress: 0,
  sectionIndex: 0,
  reducedMotion: false,

  setProgress: (rawProgress) => {
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    const newSectionIndex = getSectionIndex(progress);
    if (newSectionIndex !== get().sectionIndex) {
      set({ progress, sectionIndex: newSectionIndex });
    } else if (progress !== get().progress) {
      set({ progress });
    }
  },

  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));

/**
 * Attaches the single global scroll and reduced-motion listeners.
 * Ensures all scroll calculations and updates flow exclusively through the store.
 */
export function initScrollStore() {
  if (typeof window === "undefined") return () => {};

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  useScrollStore.getState().setReducedMotion(motionQuery.matches);
  const handleMotionChange = (e) => {
    useScrollStore.getState().setReducedMotion(e.matches);
  };
  motionQuery.addEventListener("change", handleMotionChange);

  const updateScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    const progress = maxScroll > 0 ? currentScroll / maxScroll : 0;
    useScrollStore.getState().setProgress(progress);
  };

  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll, { passive: true });

  return () => {
    motionQuery.removeEventListener("change", handleMotionChange);
    window.removeEventListener("scroll", updateScroll);
    window.removeEventListener("resize", updateScroll);
  };
}
