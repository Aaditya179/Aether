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
