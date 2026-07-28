import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // Sanity Studio v6 imports React 19.2 APIs (e.g. useEffectEvent) that Next's
  // bundler doesn't statically resolve unless the package is transpiled.
  transpilePackages: ["sanity", "@sanity/vision", "next-sanity"],
};

export default nextConfig;
