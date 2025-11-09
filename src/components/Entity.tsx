import { useRef, useState, useCallback } from 'react';
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
import gsap from 'gsap';

interface EntityProps {
  data: EntityData;
}

export function Entity({ data }: EntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [intensity, setIntensity] = useState(1.0);
  const { hoverEntity, selectEntity, goTo, sceneState, hoveredEntity } =
    useSceneStore();

  const isThisHovered = hoveredEntity === data.id;

  // Orbital animation
  useFrame((state) => {
    if (!groupRef.current || sceneState === 'loading' || sceneState === 'singularity') return;

    const time = state.clock.elapsedTime;

    // Circular orbit animation
    const orbitRadius = 150;
    const orbitSpeed = data.orbitSpeed || 20;
    const angle = (time / orbitSpeed) * Math.PI * 2;

    const x = Math.cos(angle) * orbitRadius + data.position[0];
    const y = data.position[1] + Math.sin(time * 0.5) * 20;
    const z = Math.sin(angle) * orbitRadius + data.position[2];

    groupRef.current.position.set(x, y, z);

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

      // Animate intensity
      gsap.to({ value: intensity }, {
        value: 1.6,
        duration: 0.18,
        ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        onUpdate: function () {
          setIntensity(this.targets()[0].value);
        },
      });
    },
    [data.id, hoverEntity, intensity, sceneState]
  );

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    hoverEntity(null);
    document.body.style.cursor = 'auto';

    gsap.to({ value: intensity }, {
      value: 1.0,
      duration: 0.18,
      onUpdate: function () {
        setIntensity(this.targets()[0].value);
      },
    });
  }, [hoverEntity, intensity]);

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

  // Render appropriate shape based on type
  const renderShape = () => {
    const props = {
      color: data.color,
      intensity,
      scale: isThisHovered ? 1.15 : 1,
    };

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

      {/* Label */}
      {(isHovered || isThisHovered) && (
        <Html center distanceFactor={8}>
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
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            {data.title}
          </div>
        </Html>
      )}
    </group>
  );
}
