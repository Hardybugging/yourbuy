import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18212f',
        mint: '#00a878',
        coral: '#f45b69',
        gold: '#f2c14e',
      },
    },
  },
  plugins: [],
};

export default config;
