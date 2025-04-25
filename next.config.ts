import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
};

export default nextConfig;
