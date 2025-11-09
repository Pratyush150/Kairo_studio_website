import { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore, EntityData } from '../lib/sceneAPI';
import {
  FractalCrystal,
  MetaballBlob,
  CubeMatrix,
  HelixVortex,
  EnergyOrb,
  NetworkLattice,
  HolographicPrism,
  GatewayRing,
} from './EntityShapes';
import { useLOD } from '../hooks/useLOD';
import gsap from 'gsap';

interface EntityProps {
  data: EntityData;
}

export function Entity({ data }: EntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSignatureMoment, setIsSignatureMoment] = useState(false);

  // Use refs instead of state to avoid triggering re-renders in animation loops
  const intensityRef = useRef(1.0);
  const [, forceUpdate] = useState({});
  const currentPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(...data.position));
  const originalPositionRef = useRef(new THREE.Vector3());
  const intensityTweenRef = useRef<gsap.core.Tween | null>(null);

  const { hoverEntity, selectEntity, goTo, sceneState, hoveredEntity, entities, performanceMode } =
    useSceneStore();

  const isThisHovered = hoveredEntity === data.id;

  // LOD system - Improved distances for better performance
  const { lodLevel } = useLOD(currentPositionRef.current, {
    highDistance: 180,
    mediumDistance: 100,
  });

  // Listen for signature moment event
  useEffect(() => {
    const handleSignatureMoment = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { active } = customEvent.detail;

      if (active) {
        // Save current position
        if (groupRef.current) {
          originalPositionRef.current.copy(groupRef.current.position);
        }

        // Calculate position in circular formation
        const entityIndex = entities.findIndex((e) => e.id === data.id);
        const totalEntities = entities.length;
        const angle = (entityIndex / totalEntities) * Math.PI * 2;
        const radius = 80; // Tighter circle for logo formation

        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius * 0.3; // Flatter circle
        const targetZ = Math.sin(angle) * radius;

        // Kill any existing animations first
        if (groupRef.current) {
          gsap.killTweensOf(groupRef.current.position);
        }
        if (intensityTweenRef.current) {
          intensityTweenRef.current.kill();
        }

        // Animate to formation
        if (groupRef.current) {
          gsap.to(groupRef.current.position, {
            x: targetX,
            y: targetY,
            z: targetZ,
            duration: 2.0,
            ease: 'power3.inOut',
          });

          // Pulsing glow effect using ref
          const intensityProxy = { value: intensityRef.current };
          const pulseTimeline = gsap.timeline({ repeat: -1, yoyo: true });
          intensityTweenRef.current = pulseTimeline.to(intensityProxy, {
            value: 2.5,
            duration: 1.0,
            ease: 'sine.inOut',
            onUpdate: () => {
              intensityRef.current = intensityProxy.value;
            },
          });
        }

        setIsSignatureMoment(true);
      } else {
        // Return to normal orbit
        setIsSignatureMoment(false);
        intensityRef.current = 1.0;

        // Kill all animations
        if (groupRef.current) {
          gsap.killTweensOf(groupRef.current.position);
        }
        if (intensityTweenRef.current) {
          intensityTweenRef.current.kill();
          intensityTweenRef.current = null;
        }
      }
    };

    window.addEventListener('kairo:signature-moment', handleSignatureMoment);
    return () => {
      window.removeEventListener('kairo:signature-moment', handleSignatureMoment);
      // Clean up on unmount
      if (intensityTweenRef.current) {
        intensityTweenRef.current.kill();
      }
    };
  }, [data.id, entities]); // Removed intensity from dependencies

  // Orbital animation
  useFrame((state) => {
    if (!groupRef.current || sceneState === 'loading' || sceneState === 'singularity') return;

    // Skip orbital animation during signature moment
    if (isSignatureMoment) {
      // Face camera during signature moment
      groupRef.current.lookAt(state.camera.position);
      return;
    }

    const time = state.clock.elapsedTime;

    // Circular orbit animation
    const orbitRadius = 150;
    const orbitSpeed = data.orbitSpeed || 20;
    const angle = (time / orbitSpeed) * Math.PI * 2;

    const x = Math.cos(angle) * orbitRadius + data.position[0];
    const y = data.position[1] + Math.sin(time * 0.5) * 20;
    const z = Math.sin(angle) * orbitRadius + data.position[2];

    groupRef.current.position.set(x, y, z);

    // Update position ref for LOD calculation (no re-render!)
    currentPositionRef.current.set(x, y, z);

    // Face camera
    groupRef.current.lookAt(state.camera.position);
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (sceneState !== 'idle' && sceneState !== 'transition') return;
      e.stopPropagation();
      setIsHovered(true);
      hoverEntity(data.id);
      document.body.style.cursor = 'pointer';

      // Play hover sound
      window.dispatchEvent(
        new CustomEvent('kairo:play-sound', {
          detail: { type: 'hover', position: groupRef.current?.position },
        })
      );

      // Kill previous intensity tween if exists
      if (intensityTweenRef.current) {
        intensityTweenRef.current.kill();
      }

      // Animate intensity using ref
      const intensityProxy = { value: intensityRef.current };
      intensityTweenRef.current = gsap.to(intensityProxy, {
        value: 1.6,
        duration: 0.18,
        ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        onUpdate: () => {
          intensityRef.current = intensityProxy.value;
        },
      });
    },
    [data.id, hoverEntity, sceneState]
  );

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    hoverEntity(null);
    document.body.style.cursor = 'auto';

    // Kill previous intensity tween if exists
    if (intensityTweenRef.current) {
      intensityTweenRef.current.kill();
    }

    // Animate intensity back to normal using ref
    const intensityProxy = { value: intensityRef.current };
    intensityTweenRef.current = gsap.to(intensityProxy, {
      value: 1.0,
      duration: 0.18,
      onUpdate: () => {
        intensityRef.current = intensityProxy.value;
      },
    });
  }, [hoverEntity]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (sceneState !== 'idle') return;
      e.stopPropagation();

      selectEntity(data.id);

      // Play click sound
      window.dispatchEvent(
        new CustomEvent('kairo:play-sound', {
          detail: { type: 'click' },
        })
      );

      // Navigate to entity
      goTo(data.slug);

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'entity_click', {
          entity_id: data.id,
          entity_slug: data.slug,
        });
      }
    },
    [data.id, data.slug, goTo, selectEntity, sceneState]
  );

  // Render appropriate shape based on type and LOD level
  const renderShape = () => {
    const baseProps = {
      color: data.color,
      intensity: intensityRef.current,
      scale: isThisHovered ? 1.15 : 1,
    };

    // Use simple sphere for low LOD (distant objects) to improve performance
    if (performanceMode !== 'low' && lodLevel === 'low') {
      return (
        <mesh>
          <sphereGeometry args={[2, 8, 8]} />
          <meshStandardMaterial
            color={data.color}
            emissive={data.color}
            emissiveIntensity={intensityRef.current * 0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      );
    }

    // Medium LOD - slightly simplified
    const props = lodLevel === 'medium'
      ? { ...baseProps, scale: baseProps.scale * 0.9 }
      : baseProps;

    switch (data.type) {
      case 'fractal':
        return <FractalCrystal {...props} />;
      case 'metaball':
        return <MetaballBlob {...props} />;
      case 'cube-matrix':
        return <CubeMatrix {...props} />;
      case 'helix':
        return <HelixVortex {...props} />;
      case 'orb':
        return <EnergyOrb {...props} />;
      case 'lattice':
        return <NetworkLattice {...props} />;
      case 'prism':
        return <HolographicPrism {...props} />;
      case 'gateway':
        return <GatewayRing {...props} />;
      default:
        return <EnergyOrb {...props} />;
    }
  };

  // Don't show during loading/singularity
  if (sceneState === 'loading' || sceneState === 'singularity' || sceneState === 'boom') {
    return null;
  }

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {renderShape()}

      {/* Label - Only show in high/medium LOD to reduce HTML render overhead */}
      {(isHovered || isThisHovered) && lodLevel !== 'low' && (
        <Html center distanceFactor={8} zIndexRange={[0, 0]}>
          <div
            style={{
              background: 'rgba(2, 3, 18, 0.9)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${data.color}`,
              boxShadow: `0 0 20px ${data.color}40`,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#ffffff',
              textShadow: `0 0 10px ${data.color}`,
              willChange: 'transform',
            }}
          >
            {data.title}
          </div>
        </Html>
      )}
    </group>
  );
}
