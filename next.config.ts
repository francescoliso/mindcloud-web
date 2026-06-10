import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep nodemailer out of the bundle (it uses dynamic requires).
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
