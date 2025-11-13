/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#fdf6e3",
          muted: "#f2eadf",
          border: "#e6dcd0",
          text: "#3b2f2f",
          "text-muted": "#7b6f6f",
        },
        accent: {
          playground: "#9fc9eb",
          portfolio: "#b8c7a8",
          blog: "#e8b7b7",
          unified: "#d8b4fe",
        },
        // semantic roles
        primary: {
          DEFAULT: "#9fc9eb",
          light: "#c5e0f5",
          dark: "#7ab3df",
        },
        secondary: {
          DEFAULT: "#b8c7a8",
          light: "#d4e0c9",
          dark: "#9bae88",
        },
        tertiary: {
          DEFAULT: "#e8b7b7",
          light: "#f5d9d9",
          dark: "#db9595",
        },
        // status colors - more distinct
        status: {
          critical: "#e8b7b7", // tertiary - pink/red
          serious: "#f4c4a0", // orange-ish
          stable: "#b8c7a8", // secondary - green
          resolved: "#95b88f", // darker green
          processing: "#9fc9eb", // primary - blue
        },
      },
    },
  },
  plugins: [],
};
