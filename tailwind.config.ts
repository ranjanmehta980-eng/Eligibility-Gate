import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        midnight: {
          950: "#050510",
          900: "#0a0b1a",
          850: "#0e1025",
          800: "#131530",
          700: "#1a1d45",
          600: "#252866",
          accent: "#8b5cf6",
          glow: "#a855f7",
          cyan: "#06b6d4",
          emerald: "#10b981",
          rose: "#f43f5e",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "midnight-mesh":
          "radial-gradient(ellipse at 0% 0%, rgba(139, 92, 246, 0.12) 0px, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(6, 182, 212, 0.08) 0px, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.06) 0px, transparent 50%)",
        "gradient-cta": "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #8b5cf6 100%)",
        "gradient-cta-hover": "linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #a78bfa 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow 2.5s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 2s infinite",
        shimmer: "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.15)" },
          "100%": { boxShadow: "0 0 35px rgba(168, 85, 247, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.3), 0 0 60px rgba(139, 92, 246, 0.15)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)",
        "glow-pink": "0 0 20px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
