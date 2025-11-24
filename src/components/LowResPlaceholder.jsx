import React from 'react';
import { Html } from '@react-three/drei';

/**
 * LowResPlaceholder Component
 * Minimal loading indicator shown while assets are loading
 */
export default function LowResPlaceholder() {
  return (
    <>
      {/* Simple geometric placeholder */}
      <mesh>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#00E5FF" wireframe />
      </mesh>

      {/* Loading text */}
      <Html center>
        <div
          style={{
            color: '#00E5FF',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          <div style={{ marginBottom: '8px' }}>Loading Brain Core...</div>
          <div
            style={{
              width: '150px',
              height: '4px',
              background: 'rgba(0, 229, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#00E5FF',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </Html>
    </>
  );
}
