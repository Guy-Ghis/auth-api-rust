// tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ffffff',
        secondary: '#f9f9f9',
        accent: '#e0e0e0',
        highlight: '#007bff', // Primary accent color
        'light-text': '#213547',
        'dark-text': '#333333',
      },
      borderRadius: {
        lg: '12px',
      },
      boxShadow: {
        soft: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
