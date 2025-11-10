// Particle Shader
// GPU particle rendering with distance attenuation and glow

uniform sampler2D u_texture;
uniform vec3 u_color;
uniform float u_opacity;
varying vec2 vUv;
varying float vDistance;

void main() {
  // Sample glow texture
  vec4 texColor = texture2D(u_texture, gl_PointCoord);

  // Distance attenuation
  float attenuation = 1.0 / (1.0 + vDistance * 0.001);

  // Apply color and opacity
  vec3 finalColor = u_color * texColor.rgb;
  float finalAlpha = texColor.a * u_opacity * attenuation;

  gl_FragColor = vec4(finalColor, finalAlpha);
}
