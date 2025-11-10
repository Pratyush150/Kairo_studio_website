// Line Pulse Vertex Shader
// Pass line position for pulse animation

varying vec2 vUv;
varying float vLinePosition;

void main() {
  vUv = uv;
  vLinePosition = uv.x; // Use U coordinate as position along line

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
