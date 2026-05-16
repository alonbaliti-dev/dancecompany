import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        card: "var(--bg-card)",
        elevated: "var(--bg-elevated)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      boxShadow: {
        glow: "0 0 40px rgba(52, 211, 153, 0.22), 0 8px 32px rgba(0, 0, 0, 0.45)"
      },
      minHeight: {
        app: "var(--app-height)"
      },
      height: {
        app: "var(--app-height)"
      },
      padding: {
        safe: "max(0.55rem, env(safe-area-inset-bottom))",
        "nav-safe": "var(--nav-offset)"
      }
    }
  },
  plugins: []
};

export default config;
