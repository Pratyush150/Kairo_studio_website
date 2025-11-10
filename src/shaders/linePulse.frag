// Line Pulse Shader
// Animated pulse effect for Network morph connection lines

uniform vec3 u_color;
uniform float u_time;
uniform float u_pulseSpeed;
uniform float u_pulseWidth;
varying vec2 vUv;
varying float vLinePosition;

void main() {
  // Calculate pulse position moving along line
  float pulsePos = mod(u_time * u_pulseSpeed, 1.0);

  // Distance from current pulse position
  float dist = abs(vLinePosition - pulsePos);

  // Create pulse with smooth falloff
  float pulse = smoothstep(u_pulseWidth, 0.0, dist);

  // Base line brightness
  float baseBrightness = 0.3;

  // Combine base + pulse
  float brightness = baseBrightness + pulse * 0.7;

  // Apply color
  vec3 color = u_color * brightness;

  // Add extra glow at pulse center
  color += pulse * vec3(1.0) * 0.3;

  gl_FragColor = vec4(color, 0.8 + pulse * 0.2);
}
