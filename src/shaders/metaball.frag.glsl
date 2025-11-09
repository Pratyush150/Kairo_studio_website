uniform float u_time;
uniform vec3 u_color;
uniform float u_intensity;
uniform float u_opacity;
varying vec3 v_normal;
varying vec3 v_position;
varying vec3 v_viewDirection;

void main() {
  // Fresnel effect for rim lighting
  float fresnel = pow(1.0 - dot(v_normal, v_viewDirection), 3.0);

  // Subsurface scattering simulation
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  float backlight = max(0.0, dot(-v_normal, lightDir));
  vec3 subsurface = u_color * backlight * 0.5;

  // Base color with fresnel rim
  vec3 baseColor = u_color;
  vec3 rimColor = u_color * 1.5;
  vec3 finalColor = mix(baseColor, rimColor, fresnel * 0.6);

  // Add subsurface
  finalColor += subsurface;

  // Thin-film interference (subtle rainbow effect)
  float interference = sin(fresnel * 10.0 + u_time) * 0.05;
  finalColor += vec3(interference, interference * 0.8, interference * 1.2);

  // Emissive glow
  float glow = u_intensity * 0.3;
  finalColor += u_color * glow;

  // Refraction-like shimmer
  float shimmer = sin(v_position.y * 5.0 + u_time * 2.0) * 0.1 + 0.9;
  finalColor *= shimmer;

  // Transparency with fresnel
  float alpha = mix(0.7, 0.95, fresnel) * u_opacity;

  gl_FragColor = vec4(finalColor, alpha);
}
