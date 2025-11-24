import React from 'react';

/**
 * FallbackHero Component
 * Static SVG/CSS fallback for low-end devices or when WebGL is not available
 */
export default function FallbackHero() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated background gradient */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)',
          animation: 'rotate 20s linear infinite',
        }}
      />

      {/* Brain SVG placeholder */}
      <svg
        width="300"
        height="300"
        viewBox="0 0 100 100"
        style={{ filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.5))' }}
      >
        {/* Central circle */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="#00E5FF"
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Outer ring */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="#00E5FF"
          strokeWidth="0.3"
          opacity="0.4"
          strokeDasharray="5,5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="10s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Inner glow */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="#FF00E5"
          strokeWidth="0.3"
          opacity="0.3"
          strokeDasharray="3,3"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Module points */}
        <circle cx="50" cy="20" r="3" fill="#00E5FF" opacity="0.8">
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="75" cy="65" r="3" fill="#FF00E5" opacity="0.8">
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="2s"
            begin="0.66s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="25" cy="65" r="3" fill="#FFE500" opacity="0.8">
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="2s"
            begin="1.33s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Text content */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(90deg, #00E5FF, #FF00E5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Cerebral Machine
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>
          3D experience requires WebGL support
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '2rem',
            padding: '12px 24px',
            background: 'transparent',
            border: '2px solid #00E5FF',
            color: '#00E5FF',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#00E5FF';
            e.target.style.color = '#0a0a0a';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#00E5FF';
          }}
        >
          Try Again
        </button>
      </div>

      <style>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
