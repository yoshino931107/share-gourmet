// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.jp",
        port: "",
        pathname: "/150x150.png",
      },
      {
        protocol: "https",
        hostname: "placehold.jp",
        port: "",
        pathname: "/410x250.png",
      },
    ],
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
