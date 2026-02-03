import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        electric: {
          50: '#e6f9ff',
          100: '#b3edff',
          200: '#80e1ff',
          300: '#4dd5ff',
          400: '#1ac9ff',
          500: '#00bfff', // Electric Cyan
          600: '#0099cc',
          700: '#007399',
          800: '#004d66',
          900: '#002633',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b', // Deep Indigo
          950: '#0f0d2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'var(--font-geist-mono)', 'Courier New', 'monospace'],
        display: ['Inter', 'var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-mesh': 'var(--gradient-mesh)',
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'brutal': '8px 8px 0 0 rgba(0, 0, 0, 1)',
        'brutal-sm': '4px 4px 0 0 rgba(0, 0, 0, 1)',
        'brutal-lg': '12px 12px 0 0 rgba(0, 0, 0, 1)',
        'neon-cyan': '0 0 20px rgba(0, 191, 255, 0.5)',
        'neon-indigo': '0 0 20px rgba(99, 102, 241, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
