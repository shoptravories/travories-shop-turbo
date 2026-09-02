const path = require("path")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // The Medusa UI preset must stay: every @medusajs/ui component reads its
  // tokens from here.
  presets: [require("@medusajs/ui-preset")],
  // ./src/modules/** is where the entire storefront lives. Dropping it purges
  // almost every class in the build.
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      clipPath: {
        "custom-cut":
          "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)",
      },
      colors: {
        // Starter palette (British spelling) - 8 existing usages.
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
        // Travories house palette. These merge with Tailwind's defaults rather
        // than replacing them, so gray-100..950 keep working alongside.
        TextCustom: "rgba(61, 76, 94, 1)",
        BgSidebarHover: "rgb(225,221,233)",
        TextSidebar: "rgb(101, 85, 143)",
        whiteblue: { 50: "#EBF1F5" },
        purple: { 50: "#65558f" },
        green: { 50: "#30AF5B", 90: "#292C27" },
        gray: {
          10: "#EEEEEE",
          20: "#A2A2A2",
          30: "#7B7B7B",
          50: "#F4F4F4",
          90: "#141414",
        },
        orange: { 50: "#FF814C" },
        blue: { 70: "#021639" },
        yellow: { 50: "#FEC601" },
        // shadcn-style semantic tokens, driven by CSS variables in globals.css
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "var(--primary-light)",
          "light-hover": "var(--primary-light-hover)",
          "light-active": "var(--primary-light-active)",
          normal: "hsl(var(--primary-normal))",
          "normal-hover": "var(--primary-normal-hover)",
          "normal-active": "var(--primary-normal-active)",
          dark: "var(--primary-dark)",
          "dark-hover": "var(--primary-dark-hover)",
          "dark-active": "var(--primary-dark-active)",
          darker: "var(--primary-darker)",
          next: "var(--primary-next)",
          background: "var(--primary-background)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "var(--secondary-light)",
          "light-hover": "var(--secondary-light-hover)",
          "light-active": "var(--secondary-light-active)",
          normal: "var(--secondary-normal)",
          "normal-hover": "var(--secondary-normal-hover)",
          "normal-active": "var(--secondary-normal-active)",
          dark: "var(--secondary-dark)",
          "dark-hover": "var(--secondary-dark-hover)",
          "dark-active": "var(--secondary-dark-active)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Brand layer, taken verbatim from travories.com's own token ramp.
        // The `/ <alpha-value>` form is required for opacity modifiers
        // (text-brand-surface/70) to work against CSS-variable colours.
        brand: {
          primary: "hsl(var(--brand-primary) / <alpha-value>)",
          "primary-deep": "hsl(var(--brand-primary-deep) / <alpha-value>)",
          accent: "hsl(var(--brand-accent) / <alpha-value>)",
          "accent-light": "hsl(var(--brand-accent-light) / <alpha-value>)",
          slate: "hsl(var(--brand-slate) / <alpha-value>)",
          surface: "hsl(var(--brand-surface) / <alpha-value>)",
          "surface-tint": "hsl(var(--brand-surface-tint) / <alpha-value>)",
          line: "hsl(var(--brand-line) / <alpha-value>)",
          heading: "hsl(var(--brand-heading) / <alpha-value>)",
          sand: "hsl(var(--brand-sand) / <alpha-value>)",
          ink: "hsl(var(--brand-ink) / <alpha-value>)",
        },
      },
      borderRadius: {
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
        "5xl": "40px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        "8xl": "100rem",
        "10xl": "1512px",
      },
      spacing: {
        container: "1.25rem",
      },
      // Starter breakpoints (small: is used 58 times) plus the Travories ones.
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
        mobile: "600px",
        "3xl": "1680px",
        "4xl": "2200px",
      },
      fontSize: {
        "3xl": "2rem",
        tiny: "0.625rem",
        micro: "0.5rem",
      },
      fontFamily: {
        sans: [
          "var(--font-poppins)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
        poppins: ["var(--font-poppins)", "sans-serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-top": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out-top": {
          "0%": { height: "100%" },
          "99%": { height: "0" },
          "100%": { visibility: "hidden" },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": { height: "0", opacity: "0" },
        },
        "accordion-slide-down": {
          "0%": { "min-height": "0", "max-height": "0", opacity: "0" },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.45)" },
          "60%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        "float-up": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-28px) scale(0.7)" },
        },
        "badge-bump": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.45)" },
          "100%": { transform: "scale(1)" },
        },
        "like-ripple": {
          "0%": { transform: "scale(0.8)", opacity: "0.5" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
        "heart-pop":
          "heart-pop 0.35s cubic-bezier(0.36,0.07,0.19,0.97) both",
        "float-up": "float-up 0.55s ease-out forwards",
        "badge-bump": "badge-bump 0.3s ease-out both",
        "like-ripple": "like-ripple 0.45s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-radix")(), require("tailwindcss-animate")],
}
