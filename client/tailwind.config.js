/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      colors: {
        leaf: {
          50: '#f2f7f3',
          100: '#e0ede3',
          200: '#c3dac9',
          300: '#97c0a2',
          400: '#6aa37a',
          500: '#4a8760',
          600: '#376c4b',
          700: '#2c563c',
          800: '#254632',
          900: '#1e3a2a',
        },
        spice: {
          100: '#fff3e0',
          200: '#ffe0b2',
          300: '#f5c97a',
          400: '#f0a93a',
          500: '#e8921a',
          600: '#c6740f',
          700: '#a35c0d',
        },
        cream: {
          50: '#fbf8f2',
          100: '#f5efe4',
        },
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(30, 58, 42, 0.10)',
        lift: '0 18px 40px rgba(30, 58, 42, 0.16)',
      },
    },
  },
  plugins: [],
};
