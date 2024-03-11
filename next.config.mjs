await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  images: {
    domains: [
      "images.clerk.dev",
      "uploadthing.com",
      "production-gameflipusercontent.fingershock.com",
      "res.cloudinary.com",
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
    version: "1.0.0",
  },
};

export default config;
