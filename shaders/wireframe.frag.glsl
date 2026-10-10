// Fragment shader for the glowing wireframe lines.
// Renders anti-aliased line segments with bold solid core and radiant neon corona.

precision highp float;

in float vDistPx;
in float vSegmentProg;

out vec4 fragColor;

uniform vec3 uColorGlow;
uniform float uGlow;
uniform float uDrawProgress;
uniform float uDpr;

void main() {
  // Continuous smooth reveal: discard fragments beyond current draw progress
  if (vSegmentProg > uDrawProgress) {
    discard;
  }

  float maxDist = 4.0 * uDpr;
  float dist = abs(vDistPx);

  // Bold solid neon core up to 2.0 CSS pixels (4.0px full core)
  float coreDist = 2.0 * uDpr;
  float intensity;
  if (dist <= coreDist) {
    intensity = 1.0;
  } else {
    // Smooth luminous falloff outward from solid core
    float t = (dist - coreDist) / (maxDist - coreDist);
    intensity = clamp(1.0 - t, 0.0, 1.0);
    intensity = intensity * intensity;
  }

  // White-hot center: core blends towards pure bright white, outer halo is neon cyan
  vec3 neonBase = uColorGlow;
  vec3 hotWhite = vec3(1.0, 1.0, 1.0);
  float hotFactor = clamp((coreDist - dist) / coreDist, 0.0, 1.0);
  vec3 coreColor = mix(neonBase, hotWhite, hotFactor * 0.75);

  // High HDR output to trigger intense radiant bloom corona
  vec3 rgb = coreColor * intensity * (uGlow * 2.4);
  float alpha = clamp(intensity * 1.8, 0.0, 1.0);

  if (alpha < 0.005) {
    discard;
  }

  fragColor = vec4(rgb, alpha);
}
