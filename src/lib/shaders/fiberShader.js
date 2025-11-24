/**
 * Fiber Emissive Shader
 * Creates animated emissive glow along brain fibers
 */

export const fiberVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uDisplacement;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vElevation;

  // Simplex 3D Noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Animated displacement along fibers
    float noise = snoise(position * 2.0 + uTime * uSpeed * 0.5);
    float elevation = noise * uDisplacement;

    vElevation = elevation;

    vec3 newPosition = position + normal * elevation;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
  }
`;

export const fiberFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uBaseColor;
  uniform vec3 uEmissiveColor;
  uniform float uEmissiveIntensity;
  uniform float uPulseFrequency;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);

    // Animated pulse along fibers
    float pulse = sin(vPosition.y * 3.0 - uTime * uSpeed * uPulseFrequency) * 0.5 + 0.5;

    // Combine elevation with pulse
    float intensity = (vElevation * 0.5 + 0.5) * pulse;

    // Base color with emissive glow
    vec3 color = mix(uBaseColor, uEmissiveColor, intensity);

    // Add fresnel glow
    vec3 fresnelGlow = uEmissiveColor * fresnel * uEmissiveIntensity;
    color += fresnelGlow;

    // Add brightness variation
    float brightness = 1.0 + pulse * 0.3;
    color *= brightness;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const fiberShaderUniforms = {
  uTime: { value: 0 },
  uSpeed: { value: 1.0 },
  uDisplacement: { value: 0.1 },
  uBaseColor: { value: [0.1, 0.1, 0.18] }, // #1a1a2e
  uEmissiveColor: { value: [0.0, 0.898, 1.0] }, // #00E5FF
  uEmissiveIntensity: { value: 1.5 },
  uPulseFrequency: { value: 2.0 },
};
