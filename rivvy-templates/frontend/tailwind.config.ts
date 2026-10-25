import type { Config } from "tailwindcss";

// TEMPLATE: After copying this app to the monorepo root, change "../../rivvy-ui" to "../rivvy-ui".
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../../rivvy-ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {},
};

export default config;
