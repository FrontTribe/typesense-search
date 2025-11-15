/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './dev/app/**/*.{js,ts,jsx,tsx,mdx}',
    './dev/app/**/*.css',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Enable preflight for search-demo only (it has its own isolated layout)
  corePlugins: {
    preflight: true, // Enable for proper Tailwind base styles
  },
}

