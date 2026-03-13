import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f8f4",
          100: "#dcefe0",
          500: "#2f7a4f",
          600: "#266543",
          700: "#1e5136"
        },
        surface: {
          50: "#f8f9fa",
          100: "#eef1f3",
          900: "#101418"
        },
        status: {
          success: "#1f8f4f",
          warning: "#d18a00",
          danger: "#c0392b",
          info: "#2c7be5"
        }
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem"
      },
      boxShadow: {
        card: "0 6px 20px rgba(16, 20, 24, 0.08)",
        soft: "0 2px 10px rgba(16, 20, 24, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
