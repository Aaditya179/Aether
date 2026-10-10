// Vertex shader for wireframe objects and edge geometries.
// Expands edge lines into screen-space camera-facing quads with pixel-accurate widths
// and morphs between 3D object edges and flat 2D viewport grid state.

in vec3 position;
in vec3 pointOther;
in vec3 positionGrid;
in vec3 pointOtherGrid;
in float side;
in float segmentProg;

out float vDistPx;
out float vSegmentProg;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uCollapse;

void main() {
  // Morph between 3D geometry edges and flat 2D grid edges
  vec3 pA = mix(position, positionGrid, uCollapse);
  vec3 pB = mix(pointOther, pointOtherGrid, uCollapse);

  vec4 clipA = projectionMatrix * modelViewMatrix * vec4(pA, 1.0);
  vec4 clipB = projectionMatrix * modelViewMatrix * vec4(pB, 1.0);

  // Normalize to NDC
  vec2 ndcA = clipA.xy / clipA.w;
  vec2 ndcB = clipB.xy / clipB.w;

  // Convert to screen pixel coordinates
  vec2 screenA = (ndcA * 0.5 + 0.5) * uResolution;
  vec2 screenB = (ndcB * 0.5 + 0.5) * uResolution;

  vec2 dir = screenB - screenA;
  float len = length(dir);
  vec2 normal = len > 0.0001 ? vec2(-dir.y, dir.x) / len : vec2(0.0, 1.0);

  // Soft falloff distance: 1.5 CSS pixels scaled by DPR
  float maxDistPx = 1.5 * uDpr;
  vec2 offsetPx = normal * (side * maxDistPx);

  // Convert pixel offset back to clip space
  vec2 offsetNdc = (offsetPx / uResolution) * 2.0;
  vec4 finalClip = clipA;
  finalClip.xy += offsetNdc * clipA.w;

  gl_Position = finalClip;
  vDistPx = side * maxDistPx;
  vSegmentProg = segmentProg;
}
