import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--bg-card)",
        "card-foreground": "var(--card-foreground)",
        elevated: "var(--bg-elevated)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        hairline: "var(--hairline)",
        accent: "var(--color-accent)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)"
        },
        gold: "var(--gold)",
        rose: "var(--rose)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)"
      },
      opacity: {
        3: "0.03",
        8: "0.08"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      borderRadius: {
        sm: "calc(var(--radius) - 6px)",
        md: "calc(var(--radius) - 4px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 6px)",
        "2xl": "calc(var(--radius) + 12px)",
        "3xl": "calc(var(--radius) + 20px)"
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
