// Fresnel Rim Shader
// Creates glowing rim effect based on viewing angle

uniform vec3 u_baseColor;
uniform vec3 u_rimColor;
uniform float u_rimPower;
uniform float u_rimIntensity;
uniform float u_hoverStrength;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Calculate view direction
  vec3 viewDir = normalize(cameraPosition - vPosition);

  // Fresnel calculation
  float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
  fresnel = pow(fresnel, u_rimPower);

  // Mix rim color (accent + white)
  vec3 rimColor = mix(u_rimColor, vec3(1.0), 0.5);

  // Apply fresnel with intensity
  vec3 color = mix(u_baseColor, rimColor, fresnel * u_rimIntensity);

  // Add hover pulse
  color += rimColor * u_hoverStrength * 0.5;

  // Emissive boost
  float emissive = fresnel * u_rimIntensity * (1.0 + u_hoverStrength);

  gl_FragColor = vec4(color + emissive * 0.3, 1.0);
}
