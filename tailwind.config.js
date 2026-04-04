/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00E5FF",
        "bg-main": "#0e0e0e",
      },
    },
  },
  plugins: [],
}
