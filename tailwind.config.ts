import type { Config } from "tailwindcss";

// Lightfield-inspired design system. Near-monochromatic neutral palette with
// soft transparency overlays. Existing class names (ink-*, brand-*) are kept
// and remapped onto the new tokens so existing components automatically pick
// up the new aesthetic without a sweeping refactor.

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Untitled Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["DM Mono", "JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["Untitled Serif", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        // Lightfield scale — single source of truth for the type hierarchy.
        // Always weight 400; size + letter-spacing carry the emphasis.
        "display": ["32px", { lineHeight: "1.15", letterSpacing: "-0.035em", fontWeight: "400" }],
        "h1": ["28px", { lineHeight: "1.20", letterSpacing: "-0.030em", fontWeight: "400" }],
        "h2": ["24px", { lineHeight: "1.25", letterSpacing: "-0.020em", fontWeight: "400" }],
        "h3": ["21px", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "400" }],
        "h4": ["19px", { lineHeight: "1.30", letterSpacing: "-0.010em", fontWeight: "400" }],
        "base": ["15px", { lineHeight: "1.50", letterSpacing: "0", fontWeight: "400" }],
        "small": ["13px", { lineHeight: "1.50", letterSpacing: "0", fontWeight: "400" }],
        "xs": ["12px", { lineHeight: "1.45", letterSpacing: "0", fontWeight: "400" }],
        "mono-caps": ["10px", { lineHeight: "1.00", letterSpacing: "1px", fontWeight: "500" }],
      },
      colors: {
        // ── Neutral z-scale (light mode) ─────────────────────────────────
        // Existing `ink-*` aliases are remapped onto these so existing
        // components keep working — values approximate the Lightfield
        // neutral surface system.
        ink: {
          50:  "#f9f9f8",   // bg primary  (was ink-50 — was already light)
          100: "#f5f5f3",   // bg secondary (cards, panels, nav pill)
          200: "rgba(0,0,0,0.06)", // border-subtle  (transparency overlay)
          300: "rgba(0,0,0,0.12)", // border-moderate
          400: "rgba(0,0,0,0.25)", // text-muted
          500: "rgba(0,0,0,0.50)", // text-tertiary
          600: "rgba(0,0,0,0.60)", // text-secondary
          700: "rgba(0,0,0,0.75)", // text-primary
          800: "rgba(0,0,0,0.85)", // high-emphasis text
          900: "rgb(20, 20, 19)",  // interactive primary (near-black CTA)
          950: "rgb(9, 9, 9)",     // obsidian / inverse bg
        },
        // ── Soft blue accent — used only for active/selected/links ───────
        brand: {
          50:  "#eef4fa",
          100: "#d7e6f3",
          500: "#6fa8d6",
          600: "#5d99c9",
          700: "#4d87b8",
          900: "#1f4a6f",
        },
        // ── AI accent kept but desaturated to match the monochrome bias.
        ai: {
          50:  "#f3f0ef",
          100: "#e6e2e0",
          500: "rgba(0,0,0,0.50)",
          600: "rgba(0,0,0,0.60)",
          700: "rgba(0,0,0,0.75)",
        },
      },
      borderRadius: {
        none: "0",
        sm:  "4px",   // tags, chips, inputs
        DEFAULT: "6px",
        md:  "6px",   // buttons, small cards
        lg:  "8px",   // panels
        xl:  "10px",  // modals
        "2xl": "12px", // large cards
        full: "9999px",
      },
      boxShadow: {
        // Per the design system: no heavy shadows on cards.
        // Floating elements get a single soft drop only.
        card: "none",
        soft: "0 4px 16px rgba(0,0,0,0.06)",
        pop:  "0 4px 16px rgba(0,0,0,0.08)",
        // legacy aliases kept so existing class refs don't break
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
