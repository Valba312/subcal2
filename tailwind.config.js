/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "hsl(262 83% 58%)",
        accent: "hsl(189 92% 48%)"
      }
    }
  },
  safelist: [
    "text-primary","bg-primary","border-primary",
    "from-primary","to-accent","bg-gradient-to-r"
  ],
  plugins: []
};