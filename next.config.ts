import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 blocks dev-only requests (HMR, etc.) from any origin but
  // localhost by default — without this, loading the app from a phone over
  // LAN (or through certain browser-automation proxies) leaves the page
  // rendered but non-interactive, since the blocked request can abort the
  // dev client script before it finishes hydrating.
  allowedDevOrigins: ["192.168.1.248", "localhost", "127.0.0.1"],
};

export default nextConfig;
