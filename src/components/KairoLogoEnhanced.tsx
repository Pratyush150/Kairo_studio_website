import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface KairoLogoProps {
  position?: [number, number, number];
}

export function KairoLogoEnhanced({ position = [0, 0, 0] }: KairoLogoProps) {
  const logoGroupRef = useRef<THREE.Group>(null);
  const logoMarkRef = useRef<THREE.Mesh>(null);
  const rimGlowRef = useRef<THREE.Mesh>(null);
  const { viewport, size, camera } = useThree();
  const { sceneState, performanceMode } = useSceneStore();

  const [isHovered, setIsHovered] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const breathPhase = useRef(0);
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);

  // Load logo texture with error handling
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/assets/logo/kairo_logo.jpg',
      (texture) => {
        console.log('[KairoLogoEnhanced] Logo texture loaded successfully');
        setLogoTexture(texture);
      },
      undefined,
      (error) => {
        console.warn('[KairoLogoEnhanced] Logo texture failed to load, using solid color fallback', error);
        setLogoTexture(null);
      }
    );
  }, []);

  // Calculate responsive scale
  const logoScale = useMemo(() => {
    const isMobile = size.width < 768;
    const scale = isMobile ? viewport.height * 0.26 : viewport.height * 0.18;
    return scale;
  }, [viewport.height, size.width]);

  // Position offset for golden ratio asymmetry
  const logoPosition = useMemo((): [number, number, number] => {
    const offsetX = -viewport.width * 0.07;
    const offsetY = -viewport.height * 0.05;
    return [offsetX, offsetY, 0];
  }, [viewport.width, viewport.height]);

  // Graphite base material
  const graphiteMaterial = useMemo(() => {
    const materialProps: THREE.MeshStandardMaterialParameters = {
      color: 0x0b0b0b, // #0b0b0b
      metalness: 0.65,
      roughness: 0.18,
      envMapIntensity: 0.9,
      transparent: true,
    };

    // Only add texture map if it loaded successfully
    if (logoTexture) {
      materialProps.map = logoTexture;
    }

    return new THREE.MeshStandardMaterial(materialProps);
  }, [logoTexture]);

  // Emissive rim material
  const rimMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xF4EDE4, // #F4EDE4 soft beige
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Fresnel shader material
  const fresnelMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_intensity: { value: 0.06 },
        u_color: { value: new THREE.Color(0xF4EDE4) },
      },
      vertexShader: `
        varying vec3 v_normal;
        varying vec3 v_viewDirection;

        void main() {
          v_normal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          v_viewDirection = normalize(cameraPosition - worldPosition.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_intensity;
        uniform vec3 u_color;
        varying vec3 v_normal;
        varying vec3 v_viewDirection;

        void main() {
          // Fresnel effect
          float fresnel = pow(1.0 - dot(v_normal, v_viewDirection), 3.0);
          float alpha = fresnel * u_intensity;

          // Warm tint on edges
          vec3 finalColor = mix(u_color, u_color * vec3(1.2, 1.1, 1.0), fresnel * 0.3);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });
  }, []);

  // Idle breathing animation (6s cycle)
  useFrame((state) => {
    if (!logoGroupRef.current) return;

    const t = state.clock.elapsedTime;

    // Breathing pulse - 6000ms cycle
    breathPhase.current = (t * 1000) % 6000;
    const breathProgress = breathPhase.current / 6000;
    const breathEase = cubicBezier(breathProgress, 0.22, 1, 0.36, 1);
    const breathScale = 1.00 + breathEase * 0.03; // 1.00 → 1.03 → 1.00

    logoGroupRef.current.scale.setScalar(breathScale * logoScale);

    // Update fresnel material time
    if (fresnelMaterial.uniforms) {
      fresnelMaterial.uniforms.u_time.value = t;

      // Pulsing emissive with 250ms phase offset
      const pulsePhase = ((t * 1000 + 250) % 6000) / 6000;
      const pulseEase = cubicBezier(pulsePhase, 0.22, 1, 0.36, 1);
      fresnelMaterial.uniforms.u_intensity.value = 0.06 + pulseEase * 0.10; // 0.06 → 0.16
    }

    // Hover tilt
    if (isHovered && logoMarkRef.current) {
      const targetRotY = pointerPos.x * 0.1; // ±6° = ±0.105 rad
      const targetRotX = pointerPos.y * 0.05; // ±3° = ±0.052 rad

      logoMarkRef.current.rotation.y = THREE.MathUtils.lerp(
        logoMarkRef.current.rotation.y,
        targetRotY,
        0.1
      );
      logoMarkRef.current.rotation.x = THREE.MathUtils.lerp(
        logoMarkRef.current.rotation.x,
        targetRotX,
        0.1
      );
    } else if (logoMarkRef.current) {
      // Return to center
      logoMarkRef.current.rotation.y = THREE.MathUtils.lerp(logoMarkRef.current.rotation.y, 0, 0.1);
      logoMarkRef.current.rotation.x = THREE.MathUtils.lerp(logoMarkRef.current.rotation.x, 0, 0.1);
    }
  });

  // Cubic bezier easing function
  const cubicBezier = (t: number, p1: number, p2: number, p3: number, p4: number) => {
    const u = 1 - t;
    return 3 * u * u * t * p1 + 3 * u * t * t * p3 + t * t * t;
  };

  // Pointer proximity detection (120px radius)
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!logoGroupRef.current) return;

      // Project logo position to screen space
      const logoWorldPos = new THREE.Vector3(...logoPosition);
      const logoScreenPos = logoWorldPos.project(camera);

      const logoScreenX = (logoScreenPos.x * 0.5 + 0.5) * size.width;
      const logoScreenY = (-(logoScreenPos.y) * 0.5 + 0.5) * size.height;

      const dx = event.clientX - logoScreenX;
      const dy = event.clientY - logoScreenY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const wasHovered = isHovered;
      const nowHovered = distance < 120;

      if (nowHovered !== wasHovered) {
        setIsHovered(nowHovered);

        if (nowHovered) {
          // Hover enter
          gsap.to(fresnelMaterial.uniforms.u_intensity, {
            value: 0.28,
            duration: 0.18,
            ease: 'power2.out',
          });

          // Play hover sound with panning
          window.dispatchEvent(new CustomEvent('kairo:play-sound', {
            detail: {
              type: 'hover',
              position: { x: (event.clientX / size.width) * 2 - 1, y: 0, z: 0 }
            }
          }));

          // Increase particle attraction
          window.dispatchEvent(new CustomEvent('kairo:logo-hover', {
            detail: { active: true }
          }));
        } else {
          // Hover leave
          gsap.to(fresnelMaterial.uniforms.u_intensity, {
            value: 0.06,
            duration: 0.24,
            ease: 'power2.out',
          });

          window.dispatchEvent(new CustomEvent('kairo:logo-hover', {
            detail: { active: false }
          }));
        }
      }

      // Update pointer position for tilt
      if (nowHovered) {
        setPointerPos({
          x: dx / 120, // Normalize -1 to 1
          y: dy / 120,
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [camera, size, logoPosition, isHovered, fresnelMaterial]);

  // Handle click / explosion sequence
  useEffect(() => {
    const handleClick = () => {
      if (sceneState !== 'idle') return;

      // Trigger explosion sequence
      window.dispatchEvent(new CustomEvent('kairo:explosion-sequence'));
    };

    const handleLogoClick = (event: MouseEvent) => {
      if (!logoGroupRef.current || !isHovered) return;
      handleClick();
    };

    window.addEventListener('click', handleLogoClick);
    return () => window.removeEventListener('click', handleLogoClick);
  }, [isHovered, sceneState]);

  // Handle explosion sequence
  useEffect(() => {
    const handleExplosion = () => {
      if (!logoGroupRef.current || !logoMarkRef.current) return;

      console.log('[KairoLogo] Triggering explosion sequence');

      const tl = gsap.timeline();

      // Phase 1: Compression (0-420ms)
      tl.to(logoGroupRef.current.scale, {
        x: logoScale * 0.18,
        y: logoScale * 0.18,
        z: logoScale * 0.18,
        duration: 0.34,
        ease: 'power3.in',
      }, 0);

      tl.to(fresnelMaterial.uniforms.u_intensity, {
        value: 1.6, // White-hot
        duration: 0.34,
      }, 0);

      // Phase 2: Play boom sound at 240ms
      tl.add(() => {
        window.dispatchEvent(new CustomEvent('kairo:play-sound', {
          detail: { type: 'boom' }
        }));
      }, 0.24);

      // Phase 3: Explosion (420-720ms)
      tl.add(() => {
        window.dispatchEvent(new CustomEvent('kairo:particle-explosion', {
          detail: { position: logoPosition }
        }));
      }, 0.42);

      // Phase 4: Fade out (720-1200ms)
      tl.to(logoGroupRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.48,
        ease: 'power3.out',
      }, 0.72);

      tl.to(fresnelMaterial.uniforms.u_intensity, {
        value: 0,
        duration: 0.48,
      }, 0.72);
    };

    window.addEventListener('kairo:explosion-sequence', handleExplosion);
    return () => window.removeEventListener('kairo:explosion-sequence', handleExplosion);
  }, [logoScale, logoPosition, fresnelMaterial]);

  // Don't render during certain states
  if (sceneState === 'boom' || sceneState === 'transition' || sceneState === 'panel') {
    return null;
  }

  return (
    <group ref={logoGroupRef} position={logoPosition}>
      {/* Main logo mark */}
      <mesh ref={logoMarkRef}>
        <planeGeometry args={[20, 20]} />
        <primitive object={graphiteMaterial} attach="material" />
      </mesh>

      {/* Rim glow (slightly inflated) */}
      <mesh ref={rimGlowRef} scale={1.002}>
        <planeGeometry args={[20, 20]} />
        <primitive object={rimMaterial} attach="material" />
      </mesh>

      {/* Fresnel overlay */}
      <mesh scale={1.001}>
        <planeGeometry args={[20, 20]} />
        <primitive object={fresnelMaterial} attach="material" />
      </mesh>

      {/* Point light for scene illumination */}
      <pointLight
        intensity={isHovered ? 3.0 : 2.0}
        distance={200}
        color={0xF4EDE4}
        decay={2}
      />
    </group>
  );
}
