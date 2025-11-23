/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'space-purple': '#0f0724',
        'electric-cyan': '#00E5FF',
        'neon-coral': '#FF6B6B',
        'off-white': '#F7F7F9',
        'mid-gray': '#9AA0B2',
        'dark-gray': '#272B33',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(120deg, #0f0724 0%, #1a1233 50%, #00121f 100%)',
        'card-glow': 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(255,107,107,0.1) 100%)',
        'text-gradient': 'linear-gradient(90deg, #00E5FF 0%, #FF6B6B 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
