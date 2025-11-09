import { useRef, useEffect, ReactNode } from 'react';
import { Group } from 'three';
import { useLOD, LODLevel } from '../hooks/useLOD';
import gsap from 'gsap';

interface LODGroupProps {
  position: [number, number, number];
  children: {
    high: ReactNode;
    medium: ReactNode;
    low: ReactNode;
  };
  enabled?: boolean;
}

/**
 * LODGroup component that smoothly transitions between different LOD levels
 * Uses opacity crossfade for seamless transitions
 */
export function LODGroup({ position, children, enabled = true }: LODGroupProps) {
  const groupRef = useRef<Group>(null);
  const { lodLevel } = useLOD(position);
  const highRef = useRef<Group>(null);
  const mediumRef = useRef<Group>(null);
  const lowRef = useRef<Group>(null);

  useEffect(() => {
    if (!enabled) {
      // If LOD is disabled, show only high detail
      if (highRef.current) highRef.current.visible = true;
      if (mediumRef.current) mediumRef.current.visible = false;
      if (lowRef.current) lowRef.current.visible = false;
      return;
    }

    // Smooth transition between LOD levels using opacity
    const fadeInDuration = 0.3;
    const fadeOutDuration = 0.2;

    switch (lodLevel) {
      case 'high':
        if (highRef.current) {
          gsap.to(highRef.current, {
            visible: true,
            duration: 0,
            onStart: () => {
              if (highRef.current) {
                highRef.current.traverse((child: any) => {
                  if (child.material) {
                    gsap.to(child.material, {
                      opacity: 1,
                      duration: fadeInDuration,
                    });
                  }
                });
              }
            },
          });
        }
        if (mediumRef.current) {
          mediumRef.current.traverse((child: any) => {
            if (child.material) {
              gsap.to(child.material, {
                opacity: 0,
                duration: fadeOutDuration,
                onComplete: () => {
                  if (mediumRef.current) mediumRef.current.visible = false;
                },
              });
            }
          });
        }
        if (lowRef.current) {
          lowRef.current.visible = false;
        }
        break;

      case 'medium':
        if (mediumRef.current) {
          gsap.to(mediumRef.current, {
            visible: true,
            duration: 0,
            onStart: () => {
              if (mediumRef.current) {
                mediumRef.current.traverse((child: any) => {
                  if (child.material) {
                    gsap.to(child.material, {
                      opacity: 1,
                      duration: fadeInDuration,
                    });
                  }
                });
              }
            },
          });
        }
        if (highRef.current) {
          highRef.current.traverse((child: any) => {
            if (child.material) {
              gsap.to(child.material, {
                opacity: 0,
                duration: fadeOutDuration,
                onComplete: () => {
                  if (highRef.current) highRef.current.visible = false;
                },
              });
            }
          });
        }
        if (lowRef.current) {
          lowRef.current.visible = false;
        }
        break;

      case 'low':
        if (lowRef.current) {
          gsap.to(lowRef.current, {
            visible: true,
            duration: 0,
            onStart: () => {
              if (lowRef.current) {
                lowRef.current.traverse((child: any) => {
                  if (child.material) {
                    gsap.to(child.material, {
                      opacity: 1,
                      duration: fadeInDuration,
                    });
                  }
                });
              }
            },
          });
        }
        if (mediumRef.current) {
          mediumRef.current.traverse((child: any) => {
            if (child.material) {
              gsap.to(child.material, {
                opacity: 0,
                duration: fadeOutDuration,
                onComplete: () => {
                  if (mediumRef.current) mediumRef.current.visible = false;
                },
              });
            }
          });
        }
        if (highRef.current) {
          highRef.current.visible = false;
        }
        break;
    }
  }, [lodLevel, enabled]);

  return (
    <group ref={groupRef} position={position}>
      <group ref={highRef}>{children.high}</group>
      <group ref={mediumRef}>{children.medium}</group>
      <group ref={lowRef}>{children.low}</group>
    </group>
  );
}
