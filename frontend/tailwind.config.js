/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corp: {
          canvas: '#0B0F19',
          surface: '#131C2E',
          dropzone: '#1E293B',
          border: '#1E293B',
          inputBg: '#0F172A',
          text: '#F8FAFC',
          mutedText: '#94A3B8',
          accent: '#2563EB',
          accentHover: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
