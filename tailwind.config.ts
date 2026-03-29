import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f8",
          100: "#d7efef",
          500: "#1f8f8a",
          600: "#18726e",
          700: "#115752"
        },
        sky: {
          50: "#eff8ff",
          100: "#dceeff",
          500: "#4e9ed9",
          700: "#2a6f9f"
        },
        earth: {
          50: "#faf5ef",
          100: "#f2e7da",
          500: "#b88256",
          700: "#7f5537"
        },
        surface: {
          50: "#f7f7f4",
          100: "#efefea",
          900: "#101418"
        },
        status: {
          success: "#198754",
          warning: "#c2881e",
          danger: "#b7473d",
          info: "#2e7bc2"
        }
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem"
      },
      boxShadow: {
        card: "0 10px 30px rgba(22, 27, 33, 0.08)",
        soft: "0 3px 12px rgba(22, 27, 33, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
