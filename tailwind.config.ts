import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        silkscreen: ['Silkscreen', 'cursive'],
      },
      colors: {
        gameboy: {
          bg: '#8b956d',
          dark: '#0f380f',
          mid: '#306230',
          light: '#8bac0f',
          lightest: '#9bbc0f',
        },
        retro: {
          dark: '#181425',
          purple: '#262b44',
          blue: '#3a4466',
          cyan: '#5a6988',
          grey: '#8b9bb4',
          white: '#c0cbdc',
          yellow: '#fee761',
          orange: '#feae34',
          red: '#ff0044',
          green: '#63c74d',
          darkgreen: '#3e8948',
          brown: '#68386c',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.85)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.85)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.9)',
        'pixel-inset': 'inset 3px 3px 0px 0px rgba(255,255,255,0.2), inset -3px -3px 0px 0px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
};
export default config;
