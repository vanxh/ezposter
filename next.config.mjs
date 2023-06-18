await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  images: {
    domains: ["images.clerk.dev"],
  },

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default config;
