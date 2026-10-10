// Fragment shader generating the posterized graffiti shape background.
// Uses domain-warped noise quantized into flat color tiers matching the active palette.

precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec3 uColorBase;
uniform vec3 uColorAccentA;
uniform vec3 uColorAccentB;
uniform float uStrokeIn;

// Efficient 2D simplex noise
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// 3-octave FBM for organic spray strokes
float fbm(vec2 p) {
  float f = 0.0;
  f += 0.5000 * snoise(p); p *= 2.02;
  f += 0.2500 * snoise(p); p *= 2.03;
  f += 0.1250 * snoise(p);
  return f;
}

// Domain-warped noise creates blobby street-art strokes
float domainWarp(vec2 p, float drift) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + drift),
    fbm(p + vec2(5.2, 1.3) + drift)
  );
  vec2 r = vec2(
    fbm(p + 2.4 * q + vec2(1.7, 9.2) + drift * 0.5),
    fbm(p + 2.4 * q + vec2(8.3, 2.8) - drift * 0.5)
  );
  return fbm(p + 2.8 * r);
}

void main() {
  vec2 aspect = uResolution.x > uResolution.y
    ? vec2(uResolution.x / max(uResolution.y, 1.0), 1.0)
    : vec2(1.0, uResolution.y / max(uResolution.x, 1.0));

  vec2 p = vUv * aspect * 2.2;

  // Slow shape drift at 5% of normal speed per Section 4.8
  float drift = uTime * 0.05;

  float rawVal = domainWarp(p, drift);

  // Hand-painted uneven edge treatment with small high-frequency noise offset (amplitude ~0.02)
  float edgeNoise = snoise(p * 32.0) * 0.02;

  // Normalization and stroke-in threshold modulation
  float val = (rawVal + 1.0) * 0.5;

  float tBase = 0.38 + edgeNoise + (1.0 - uStrokeIn) * 0.5;
  float tAccent = 0.62 + edgeNoise;

  // Strict quantization into 3 flat posterized color blocks: base, accent B, accent A
  vec3 finalColor;
  if (val < tBase) {
    finalColor = uColorBase;
  } else if (val < tAccent) {
    finalColor = uColorAccentB;
  } else {
    finalColor = uColorAccentA;
  }

  fragColor = vec4(finalColor, 1.0);
}
