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
  transpilePackages: ['three'],
  turbopack: {
    rules: {
      // Process CSS with Tailwind v4's Turbopack loader. Without this,
      // Turbopack falls back to a PostCSS transform that doesn't understand
      // Tailwind's `@theme` at-rule and emits a parse warning.
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
