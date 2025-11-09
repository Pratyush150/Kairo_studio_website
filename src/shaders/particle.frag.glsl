uniform float u_time;
uniform vec3 u_color;
uniform float u_opacity;
varying float v_distance;

void main() {
  // Create circular particle
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  // Soft edge falloff
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Distance-based opacity (closer = more opaque)
  float distanceOpacity = mix(0.2, 1.0, 1.0 - clamp(v_distance / 2000.0, 0.0, 1.0));

  // Pulsating effect
  float pulse = sin(u_time * 2.0 + v_distance * 0.01) * 0.2 + 0.8;

  // Final color with glow
  vec3 finalColor = u_color;
  float finalAlpha = alpha * distanceOpacity * pulse * u_opacity;

  // Add glow in center
  float glow = exp(-dist * 8.0);
  finalColor += vec3(glow * 0.5);

  gl_FragColor = vec4(finalColor, finalAlpha);
}
