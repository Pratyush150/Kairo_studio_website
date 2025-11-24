import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

/**
 * ModuleHotspot Component
 * Interactive 3D hotspot for brain modules with raycasting
 *
 * @param {Object} props
 * @param {string} props.moduleId - Unique module identifier
 * @param {string} props.name - Module name
 * @param {string} props.shortName - Short module name for label
 * @param {[number, number, number]} props.position - 3D position
 * @param {string} props.color - Module color (hex)
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.active - Is this module currently active
 * @param {number} props.lodLevel - Current LOD level (controls detail)
 */
export default function ModuleHotspot({
  moduleId,
  name,
  shortName,
  position = [0, 0, 0],
  color = '#00E5FF',
  onClick,
  active = false,
  lodLevel = 0,
}) {
  const meshRef = useRef();
  const outlineRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Detail based on LOD
  const segments = lodLevel === 0 ? 8 : lodLevel === 1 ? 16 : 24;

  // Animate on hover and active state
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetScale = hovered ? 1.3 : active ? 1.2 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 8
    );

    // Rotate hotspot
    meshRef.current.rotation.y += delta * (hovered ? 1.5 : 0.5);

    // Pulse outline
    if (outlineRef.current) {
      const pulseScale = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      outlineRef.current.scale.setScalar(hovered ? pulseScale : 1.0);

      // Fade outline based on hover
      const targetOpacity = hovered ? 0.6 : 0.3;
      outlineRef.current.material.opacity = THREE.MathUtils.lerp(
        outlineRef.current.material.opacity,
        targetOpacity,
        delta * 5
      );
    }
  });

  // Handle pointer events
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(moduleId);
    }
  };

  const moduleColor = new THREE.Color(color);

  return (
    <group position={position}>
      {/* Main hotspot sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.12, segments, segments]} />
        <meshStandardMaterial
          color={moduleColor}
          emissive={moduleColor}
          emissiveIntensity={hovered ? 2.0 : active ? 1.5 : 1.0}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh
        ref={outlineRef}
        position={[0, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.15, segments, segments]} />
        <meshBasicMaterial
          color={moduleColor}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Rotating ring indicator */}
      {lodLevel >= 1 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.01, 8, 32]} />
          <meshBasicMaterial
            color={moduleColor}
            transparent
            opacity={hovered ? 0.8 : 0.4}
          />
        </mesh>
      )}

      {/* Point light for glow */}
      <pointLight
        position={[0, 0, 0]}
        color={moduleColor}
        intensity={hovered ? 1.5 : active ? 1.0 : 0.5}
        distance={2}
      />

      {/* Label overlay - only show when hovered or active */}
      {(hovered || active) && (
        <Html
          position={[0, 0.3, 0]}
          center
          distanceFactor={8}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              border: `2px solid ${color}`,
              borderRadius: '8px',
              padding: '8px 16px',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              boxShadow: `0 0 20px ${color}40`,
              transform: 'translateY(-10px)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {shortName}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * ModuleHotspotLabel Component
 * Always-visible label for module hotspots
 */
export function ModuleHotspotLabel({
  name,
  position = [0, 0, 0],
  color = '#00E5FF',
  visible = true,
}) {
  if (!visible) return null;

  return (
    <Html
      position={position}
      center
      distanceFactor={10}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: `1px solid ${color}60`,
          borderRadius: '4px',
          padding: '4px 8px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: color,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
    </Html>
  );
}
