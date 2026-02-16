import type { NextConfig } from "next";

const allowedOriginsEnv = process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS ?? "";
const allowedOrigins = Array.from(
  new Set(
    allowedOriginsEnv
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
);

if (allowedOrigins.length === 0) {
  allowedOrigins.push("bli.al", "www.bli.al");
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
