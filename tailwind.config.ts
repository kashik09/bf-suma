import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ef",
          100: "#dcf2db",
          200: "#bbe4b8",
          500: "#50b748",
          600: "#3d9f38",
          700: "#2f7f2d",
          800: "#236224"
        },
        sky: {
          50: "#ecf9fe",
          100: "#d1f1fc",
          200: "#a9e4f8",
          500: "#00aadb",
          600: "#008db7",
          700: "#006f92"
        },
        earth: {
          50: "#fff7ec",
          100: "#feecd2",
          200: "#fdd6a5",
          500: "#f48132",
          600: "#de6e22",
          700: "#b7581a"
        },
        accent: {
          sun: "#f9a533",
          berry: "#ec297b",
          ink: "#231f20"
        },
        surface: {
          50: "#f7f6f2",
          100: "#eee9e1",
          900: "#231f20"
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
