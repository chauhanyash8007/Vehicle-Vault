/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        surface: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "card":    "0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / .07), 0 2px 4px -2px rgb(0 0 0 / .07)",
        "card-lg": "0 10px 15px -3px rgb(0 0 0 / .08), 0 4px 6px -4px rgb(0 0 0 / .08)",
        "glow":    "0 0 0 3px rgb(99 102 241 / .15)",
      },
      animation: {
        "fade-in":    "fadeIn 0.35s ease-out",
        "slide-up":   "slideUp 0.35s ease-out",
        "slide-down": "slideDown 0.25s ease-out",
        "scale-in":   "scaleIn 0.2s ease-out",
        "spin-slow":  "spin 2s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: 0 },                                          "100%": { opacity: 1 } },
        slideUp:   { "0%": { opacity: 0, transform: "translateY(12px)" },           "100%": { opacity: 1, transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: 0, transform: "translateY(-8px)" },           "100%": { opacity: 1, transform: "translateY(0)" } },
        scaleIn:   { "0%": { opacity: 0, transform: "scale(0.95)" },                "100%": { opacity: 1, transform: "scale(1)" } },
        pulseSoft: { "0%,100%": { opacity: 1 },                                     "50%": { opacity: 0.6 } },
      },
      backgroundImage: {
        "hero-gradient":  "linear-gradient(135deg, #312e81 0%, #4338ca 40%, #6366f1 100%)",
        "card-gradient":  "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        "brand-gradient": "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      },
    },
  },
  plugins: [],
};
