import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    loader: "akamai",
    path: "/",
  },
};

export default nextConfig;
