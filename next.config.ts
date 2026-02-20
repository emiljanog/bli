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

const serverActionBodySizeLimit = (process.env.NEXT_SERVER_ACTIONS_BODY_SIZE_LIMIT ?? "64mb") as NonNullable<
  NonNullable<NonNullable<NextConfig["experimental"]>["serverActions"]>["bodySizeLimit"]
>;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins,
      bodySizeLimit: serverActionBodySizeLimit,
    },
  },
};

export default nextConfig;
