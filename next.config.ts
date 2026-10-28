import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Static export (output: 'export') is incompatible with server-dependent
// features like Partial Prerendering and Cache Components. We only enable the
// static-export path when building for GitHub Pages, keeping the richer
// features available during local development.
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // These rely on a running Next.js server and cannot be used with `output: 'export'`.
  cacheComponents: !isStaticExport,
  partialPrefetching: !isStaticExport,
  transpilePackages: ['three'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // Static export configuration for GitHub Pages
  ...(isStaticExport
    ? {
        output: 'export' as const,
        basePath,
        assetPrefix: basePath,
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;
