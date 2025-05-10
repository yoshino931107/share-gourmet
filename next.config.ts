// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.jp",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imgfp.hotp.jp",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["imgfp.hotp.jp", "images.unsplash.com", "placehold.jp"],
  },
};

export default nextConfig;
