# Procedural 3D Benchmarking

A benchmarking playground for procedural 3D content generation using React Three Fiber, Three.js, and Next.js.

## Features

- Interactive 3D scene benchmarking
- Performance monitoring and metrics
- Multiple AI agent implementations for comparison

## Tech Stack

- **Framework**: Next.js 16.4.3 with App Router
- **3D Rendering**: React Three Fiber 9.8.2 + Three.js 0.186.1
- **Styling**: Tailwind CSS 4 with Turbopack
- **Runtime**: Bun 1.3.14

## Getting Started

First, install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

This project uses Next.js static export (`output: 'export'`). In Next.js 16 the
export happens automatically as part of `next build` — there is no separate
`export` command. Static export is gated behind the `STATIC_EXPORT` env var so
that local development keeps server-dependent features (Partial Prerendering,
Cache Components) that are incompatible with export.

To generate the static site locally:

```bash
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/procedural-3d-benchmarking bun run build
```

This produces a fully static site in the `out/` directory (`index.html`,
one HTML file per model page, `404.html`, and the `_next/` assets folder).
The `out/` directory is gitignored and regenerated on each build — it is not
committed to the repo.

- `NEXT_PUBLIC_BASE_PATH` must match the repository name so asset URLs resolve
  correctly on the project Pages URL (`https://<user>.github.io/<repo>/`).
- Leave `NEXT_PUBLIC_BASE_PATH` empty when deploying to a user/org root site
  (`https://<user>.github.io/`).

## Deployment

### GitHub Pages

Deployment is automated by a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that runs on every push to `main`. It builds
the static site, uploads the `out/` directory as a Pages artifact, and deploys
it — you never commit the generated HTML yourself.

One-time repository setup: go to **Settings → Pages → Build and deployment →
Source** and select **GitHub Actions**.

The deployed site is served at `https://<user>.github.io/<repo>/`.

## Project Structure

```
app/
├── components/          # Shared React components
├── gemini/             # Gemini agent implementation
├── opus/               # Claude Opus agent implementation
├── qwen3coder/         # Qwen3 Coder agent implementation
├── sol/                # Sol agent implementation
├── page.tsx            # Main landing page
├── layout.tsx          # Root layout
└── globals.css         # Global styles
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

This project is open source and available under the MIT License.
