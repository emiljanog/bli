import type { NextConfig } from "next";

const allowedOriginsEnv = process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS ?? "";
function normalizeOriginHost(value: string): string {
  const first = value.trim().split(",")[0]?.trim() ?? "";
  const withoutProtocol = first.replace(/^https?:\/\//i, "");
  return withoutProtocol.split("/")[0]?.trim() ?? "";
}

const allowedOrigins = Array.from(
  new Set(
    allowedOriginsEnv
      .split(",")
      .map((item) => normalizeOriginHost(item))
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
