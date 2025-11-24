/**
 * Particle Stream Shader
 * GPU-accelerated particle system for brain fiber streams
 */

export const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSize;
  uniform float uRandomness;

  attribute float aProgress;
  attribute float aSpeed;
  attribute vec3 aOffset;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vProgress;

  // Simple hash function for randomness
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    vProgress = aProgress;

    // Animate progress along path
    float animatedProgress = mod(aProgress + uTime * uSpeed * aSpeed, 1.0);

    // Fade in/out at start and end
    float fadeIn = smoothstep(0.0, 0.1, animatedProgress);
    float fadeOut = smoothstep(1.0, 0.9, animatedProgress);
    vAlpha = fadeIn * fadeOut;

    // Color variation based on progress
    vec3 startColor = vec3(0.0, 0.898, 1.0); // #00E5FF (cyan)
    vec3 midColor = vec3(1.0, 0.0, 0.898);   // #FF00E5 (magenta)
    vec3 endColor = vec3(1.0, 0.898, 0.0);   // #FFE500 (yellow)

    if (animatedProgress < 0.5) {
      vColor = mix(startColor, midColor, animatedProgress * 2.0);
    } else {
      vColor = mix(midColor, endColor, (animatedProgress - 0.5) * 2.0);
    }

    // Calculate position along curved path
    float angle = animatedProgress * 6.28318; // 2 * PI
    float radius = 1.2 + sin(animatedProgress * 3.14159) * 0.3;

    vec3 pathPosition = vec3(
      cos(angle) * radius,
      sin(animatedProgress * 3.14159 * 3.0) * 0.5,
      sin(angle) * radius
    );

    // Add randomness offset
    vec3 randomOffset = aOffset * uRandomness;
    vec3 finalPosition = pathPosition + randomOffset;

    // Model view projection
    vec4 modelPosition = modelMatrix * vec4(finalPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Size attenuation with distance
    float sizeFactor = uSize * (1.0 - animatedProgress * 0.5);
    gl_PointSize = sizeFactor * (300.0 / -viewPosition.z);
  }
`;

export const particleFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vProgress;

  void main() {
    // Circular particle shape
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // Soft edge
    float alpha = smoothstep(0.5, 0.3, dist) * vAlpha;

    // Bright center
    float glow = smoothstep(0.5, 0.0, dist);
    vec3 color = vColor * (1.0 + glow * 0.5);

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const particleShaderUniforms = {
  uTime: { value: 0 },
  uSpeed: { value: 0.3 },
  uSize: { value: 8.0 },
  uRandomness: { value: 0.05 },
};

/**
 * Generate particle attributes for instanced rendering
 * @param {number} count - Number of particles
 * @returns {Object} Attribute buffers
 */
export function generateParticleAttributes(count) {
  const progress = new Float32Array(count);
  const speed = new Float32Array(count);
  const offset = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Distribute particles along path
    progress[i] = Math.random();

    // Random speed variation
    speed[i] = 0.8 + Math.random() * 0.4;

    // Random offset for variety
    offset[i * 3 + 0] = (Math.random() - 0.5) * 0.2;
    offset[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
    offset[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
  }

  return { progress, speed, offset };
}
