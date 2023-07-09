await import("./src/env.mjs");

import packageJson from "./package.json" assert { type: "json", integrity: "sha384-ABC123" };

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  images: {
    domains: [
      "images.clerk.dev",
      "uploadthing.com",
      "production-gameflipusercontent.fingershock.com",
    ],
  },

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  experimental: {
    esmExternals: false,
  },

  publicRuntimeConfig: {
    version: packageJson.version,
  },
};

export default config;
