// Fragment shader for the glowing wireframe lines.
// Renders anti-aliased line segments with soft falloff glow and brightness scaling.

precision highp float;

in float vDistPx;
in float vSegmentIndex;

out vec4 fragColor;

uniform vec3 uColorGlow;
uniform float uGlow;
uniform float uDrawProgress;
uniform float uDpr;

void main() {
  // Hide segments that have not drawn in yet
  if (vSegmentIndex > uDrawProgress) {
    discard;
  }

  // Soft falloff: 1.0 at center line, 0.0 at 1.5 CSS pixels (scaled by DPR)
  float maxDist = 1.5 * uDpr;
  float dist = abs(vDistPx);
  float falloff = clamp(1.0 - (dist / maxDist), 0.0, 1.0);

  // Soft falloff curve
  float intensity = falloff * falloff;

  vec3 rgb = uColorGlow * intensity * uGlow;
  float alpha = intensity * clamp(uGlow, 0.0, 1.0);

  if (alpha < 0.002) {
    discard;
  }

  fragColor = vec4(rgb, alpha);
}
