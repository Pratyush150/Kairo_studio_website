import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Universe from './Universe';
import Hub from './Hub';
import Plate from './Plate';
import gsap from 'gsap';
import * as THREE from 'three';

const Scene = ({
  plates,
  activePlateIndex,
  onPlateChange,
  onPlateClick,
  isPanelOpen,
  reducedMotion,
  onLoadComplete
}) => {
  const { camera } = useThree();
  const groupRef = useRef();
  const hubRef = useRef();
  const plateRefs = useRef([]);
  const [hoveredPartition, setHoveredPartition] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Camera animation parameters
  const cameraTarget = useRef({ z: 8, x: 0, y: 0 });

  useEffect(() => {
    if (plateRefs.current.length === plates.length) {
      onLoadComplete?.();
    }
  }, [plates.length, onLoadComplete]);

  // Handle plate position based on active index
  useEffect(() => {
    plates.forEach((plate, index) => {
      const plateRef = plateRefs.current[index];
      if (!plateRef) return;

      const isActive = index === activePlateIndex;
      const angleStep = (Math.PI * 2) / plates.length;
      const relativeIndex = index - activePlateIndex;
      const angle = relativeIndex * angleStep;
      const radius = 5.2;

      const targetX = Math.sin(angle) * radius;
      const targetZ = Math.cos(angle) * radius;
      const targetY = isActive ? -0.12 : 0;
      const targetScale = isActive ? 1.04 : 0.98;
      const targetRotationY = -angle;

      const duration = reducedMotion ? 0 : 0.26;
      const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

      gsap.to(plateRef.position, {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration,
        ease
      });

      gsap.to(plateRef.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: reducedMotion ? 0 : 0.18,
        ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });

      gsap.to(plateRef.rotation, {
        y: targetRotationY,
        duration,
        ease
      });
    });
  }, [activePlateIndex, plates.length, reducedMotion]);

  // Camera animation when panel opens/closes
  useEffect(() => {
    const duration = reducedMotion ? 0 : 0.7;

    if (isPanelOpen) {
      // Dolly in and center on active plate
      gsap.to(cameraTarget.current, {
        z: 4,
        x: 0,
        y: 0,
        duration,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)'
      });
    } else {
      // Return to default position
      gsap.to(cameraTarget.current, {
        z: 8,
        x: 0,
        y: 0,
        duration: reducedMotion ? 0 : 0.36,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)'
      });
    }
  }, [isPanelOpen, reducedMotion]);

  // Animate camera position
  useFrame(() => {
    camera.position.z += (cameraTarget.current.z - camera.position.z) * 0.1;
    camera.position.x += (cameraTarget.current.x - camera.position.x) * 0.1;
    camera.position.y += (cameraTarget.current.y - camera.position.y) * 0.1;
    camera.lookAt(0, 0, 0);
  });

  // Hover detection
  const handlePointerMove = (event) => {
    if (isPanelOpen) return;

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Check intersection with hub
    if (hubRef.current) {
      const intersects = raycaster.intersectObject(hubRef.current, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        const distance = Math.sqrt(point.x * point.x + point.z * point.z);

        if (distance <= 2.2) { // 220px equivalent in 3D units
          // Map X position to partition
          const angle = Math.atan2(point.x, point.z);
          const angleStep = (Math.PI * 2) / plates.length;
          const partition = Math.floor(((angle + Math.PI) / angleStep) + 0.5) % plates.length;

          if (partition !== hoveredPartition) {
            setHoveredPartition(partition);
            onPlateChange(partition);

            // Clear previous timeout
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }

            // Set tooltip timeout
            hoverTimeoutRef.current = setTimeout(() => {
              setTooltipVisible(true);
            }, 1200);
          }
        } else {
          setHoveredPartition(null);
          setTooltipVisible(false);
        }
      }
    }
  };

  const handlePlateClick = (index) => {
    if (!isPanelOpen && index === activePlateIndex) {
      onPlateClick(index);
    }
  };

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4a90e2" />

      {/* Universe background */}
      <Universe reducedMotion={reducedMotion} />

      {/* Hub */}
      <Hub
        ref={hubRef}
        onPointerMove={handlePointerMove}
        reducedMotion={reducedMotion}
      />

      {/* Plates */}
      {plates.map((plate, index) => (
        <Plate
          key={plate.id}
          ref={el => plateRefs.current[index] = el}
          plate={plate}
          index={index}
          isActive={index === activePlateIndex}
          onClick={() => handlePlateClick(index)}
          reducedMotion={reducedMotion}
          showTooltip={tooltipVisible && index === activePlateIndex}
        />
      ))}

      {/* Orbit controls (disabled during panel) */}
      {!isPanelOpen && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      )}
    </group>
  );
};

export default Scene;
