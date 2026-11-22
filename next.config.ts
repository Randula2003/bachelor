import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets other devices on the local network (e.g. a phone opening
  // http://192.168.8.188:3000) use hot reload during `next dev`.
  // Dev-only: has no effect on production builds.
  allowedDevOrigins: ["192.168.8.188"],
};

export default nextConfig;
