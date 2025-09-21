export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#ffffff",
        primary: "#576cbc",
        secondary: "#19376d",
        dark: "#0b2447",
        bg: "#04152d",
        reoBlue: "#0b2447", // Dark blue used for text/buttons
        reoLight: "#E2EDF6", // Light blue used for background gradients
        reoPale: "#f0f8ff", // Optional: for feature cards background
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        robot: ["Roboto", "sans-serif"], // Add in case you use robot font anywhere
      },
    },
  },
  plugins: [],
};
