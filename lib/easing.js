// Pure JavaScript easing functions for scroll progression, snaps, and transitions.
// Implemented without external framework dependencies to ensure deterministic calculations.

/**
 * Standard cubic ease in-out curve for draw-in and reveal transitions.
 * @param {number} t - Input progress [0, 1]
 * @returns {number} Eased output [0, 1]
 */
export function easeInOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

/**
 * Exponential ease-out curve for snaps and sudden palette shifts.
 * @param {number} t - Input progress [0, 1]
 * @returns {number} Eased output [0, 1]
 */
export function easeOutExpo(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped === 1 ? 1 : 1 - Math.pow(2, -10 * clamped);
}

/**
 * Linear interpolation utility.
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Factor [0, 1]
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
