// Particle Vertex Shader
// GPU particle positioning and size attenuation

uniform float u_time;
uniform float u_size;
uniform sampler2D u_flowTexture;
varying vec2 vUv;
varying float vDistance;

// Simple noise for movement
float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  vUv = uv;

  // Calculate position with flow movement
  vec3 pos = position;

  // Add subtle noise-based movement
  float n = noise(pos + u_time * 0.1);
  pos.y += sin(u_time * 0.5 + n * 6.28) * 0.5;
  pos.x += cos(u_time * 0.3 + n * 6.28) * 0.3;

  // Calculate view space position
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vDistance = length(mvPosition.xyz);

  // Size attenuation by distance
  float sizeAttenuation = u_size / vDistance;

  gl_PointSize = sizeAttenuation;
  gl_Position = projectionMatrix * mvPosition;
}
