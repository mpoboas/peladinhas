import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable streaming metadata. Next 16 streams `<__next_metadata_boundary__>`
  // by default, which produces a hydration mismatch (server renders the div
  // with `style={display:"contents"}` while the client re-renders it inside a
  // `<Suspense name="Next.Metadata">` wrapper). Forcing all UAs through the
  // blocking metadata path keeps the SSR and CSR trees identical.
  // Docs: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/htmlLimitedBots.md
  htmlLimitedBots: /.*/,
};

export default nextConfig;
