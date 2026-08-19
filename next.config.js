/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare's default Next.js image loader isn't wired up; images are
    // served as-is (see lib/imageStorage.ts / pages/api/images/[...key].ts).
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Stripe's package.json "workerd" export condition points at a file Next's
  // build tracer doesn't copy, which breaks OpenNext's esbuild bundling step.
  // Keeping it external avoids that path resolution entirely.
  serverExternalPackages: ["stripe"],
};

module.exports = nextConfig;

// Wires Cloudflare bindings (D1, R2) into `next dev` so getCloudflareContext()
// works locally the same way it does once deployed. No-op until
// @opennextjs/cloudflare is installed.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
    .catch(() => {
      // Package not installed yet (e.g. before `npm install`) — safe to skip.
    });
}
