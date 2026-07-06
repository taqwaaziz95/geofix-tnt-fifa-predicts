import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--wc-navy)",
        foreground: "#ffffff",
        "wc-navy": "#060B1E",
        "wc-navy-light": "#0D1535",
        "wc-gold": "#F5B800",
        "wc-gold-light": "#FFD740",
        "wc-blue": "#00C2FF",
        "wc-green": "#00E87A",
        "wc-red": "#FF4757",
        "wc-purple": "#8B5CF6",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.68,-0.55,0.265,1.55)",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          from: { opacity: "0", transform: "scale(0.8)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseGold: {
          "0%,100%": { boxShadow: "0 0 10px rgba(245,184,0,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(245,184,0,0.7)" },
        },
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #F5B800 0%, #FFD740 50%, #F5B800 100%)",
        "wc-gradient":
          "linear-gradient(135deg, #060B1E 0%, #0D1535 50%, #060B1E 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
