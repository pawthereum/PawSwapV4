/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero': 'url("/img/hero-bg.svg")',
        'gradient-radial': 'radial-gradient(125% 300% at center -200%, var(--tw-gradient-stops))',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#FF65B3",
          secondary: "rgb(56, 58, 107)",
          "base-content": "rgb(56, 58, 107)"
        },
      },
      {
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "#FF65B3",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}
