/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{jsx,ts,html,js}", './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      display: ["group-hover"]
    },
  },
  plugins: [],
}
