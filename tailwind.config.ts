import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "system-primary-background": "#EAEAEA",
        "system-secondary-background": "#F2F2F2",
        "system-third-background": "#D493A0",
        "system-third-background-opacity": "#c08297",
      },
    },
  },
  plugins: [],
} satisfies Config;
