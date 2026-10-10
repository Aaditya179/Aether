// Single source of truth for section boundaries, copy text, and palette keys.
// Contains normalized progress boundaries, copy placeholders, and active color definitions.

export const PALETTE = {
  base: "#0B0B0C",
  accentA: "#D7FF3A",
  accentB: "#FF2E88",
  glow: "#22E4FF",
  text: "#F5F5F5",
  textInverse: "#0B0B0C",
};

export const SECTION_PALETTES = {
  section0: {
    accentA: "#D7FF3A", // Acid yellow-green
    accentB: "#FF2E88", // Hot pink
  },
  section1: {
    accentA: "#D7FF3A", // Acid yellow-green
    accentB: "#0B0B0C", // Near-black base
  },
  section2: {
    accentA: "#FF2E88", // Hot pink dominant in Section 2
    accentB: "#D7FF3A", // Acid yellow-green secondary
  },
  section3: {
    accentA: "#22E4FF", // Cyan glow dominant in Section 3
    accentB: "#FF2E88", // Hot pink
  },
  section4: {
    accentA: "#D7FF3A", // Acid yellow-green
    accentB: "#22E4FF", // Cyan secondary
  },
};

export const SECTIONS = [
  {
    index: 0,
    name: "Opening",
    start: 0.0,
    end: 0.1,
    headline: "TAG GRID", // PLACEHOLDER COPY
    body: "Scroll to draw the line.", // PLACEHOLDER COPY
    paletteKey: "section0",
  },
  {
    index: 1,
    name: "Section 1",
    start: 0.1,
    end: 0.3,
    headline: "DRAW THE FORM", // PLACEHOLDER COPY
    body: "The shape is built one edge at a time.", // PLACEHOLDER COPY
    paletteKey: "section1",
  },
  {
    index: 2,
    name: "Section 2",
    start: 0.3,
    end: 0.5,
    headline: "REPEAT THE SIGNAL", // PLACEHOLDER COPY
    body: "The same form, multiplied and turned.", // PLACEHOLDER COPY
    paletteKey: "section2",
  },
  {
    index: 3,
    name: "Section 3",
    start: 0.5,
    end: 0.7,
    headline: "HEAT THE EDGE", // PLACEHOLDER COPY
    body: "Light gathers where the lines meet.", // PLACEHOLDER COPY
    paletteKey: "section3",
  },
  {
    index: 4,
    name: "Final",
    start: 0.7,
    end: 1.0,
    headline: "GRID THE STREET", // PLACEHOLDER COPY
    body: "Everything collapses into one surface.", // PLACEHOLDER COPY
    paletteKey: "section4",
  },
];

export function getSectionIndex(progress) {
  for (let i = SECTIONS.length - 1; i >= 0; i--) {
    if (progress >= SECTIONS[i].start) {
      return i;
    }
  }
  return 0;
}

export function getLocalProgress(progress, sectionIndex) {
  const section = SECTIONS[sectionIndex];
  if (!section) return 0;
  return Math.min(Math.max((progress - section.start) / (section.end - section.start), 0), 1);
}

export function getSectionPalette(sectionIndex) {
  const section = SECTIONS[sectionIndex] || SECTIONS[0];
  return SECTION_PALETTES[section.paletteKey] || SECTION_PALETTES.section0;
}
