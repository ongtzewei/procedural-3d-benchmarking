import type { NextConfig } from 'next';

// The site is deployed to GitHub Pages as a fully static export, so
// `output: 'export'` is always on for `next build`. Static export is
// incompatible with server-dependent features such as Partial Prerendering
// and Cache Components, so those are not enabled here.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  experimental: {
    agentFeedback: true,
  },
  transpilePackages: ['three'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
