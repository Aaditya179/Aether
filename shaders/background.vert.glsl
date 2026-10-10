// Vertex shader for the full-screen background quad.
// Positions a screen-filling quad in clip space without perspective transformation.

out vec2 vUv;

void main() {
  vUv = uv;
  // Direct clip-space quad mapping spanning [-1, 1]
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
