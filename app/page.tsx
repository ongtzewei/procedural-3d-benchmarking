import Link from 'next/link';

const entries = [
  {
    name: 'Qwen3 Coder Next',
    href: '/qwen3coder',
    model: 'Alibaba',
  },
  {
    name: 'Gemini 4',
    href: '/gemini',
    model: 'Google',
  },
  {
    name: '6.1 Sol',
    href: '/sol',
    model: 'OpenAI',
  },
  {
    name: 'Opus 5.5',
    href: '/opus',
    model: 'Anthropic',
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8">
      <div className="mb-3 flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
        <span className="h-px w-8 bg-zinc-400 dark:bg-zinc-600" />
        PROCEDURAL 3D BENCHMARK
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-white sm:text-5xl">
        Same prompt, four models, one 3D scene.
      </h1>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
        This project is a side-by-side benchmark of how today&apos;s frontier
        coding models handle <strong>procedural 3D generation</strong>. Each
        model received the identical prompt and had to build an interactive
        scene from scratch using React Three Fiber and Three.js — no assets, no
        external models, just code describing geometry, lighting, materials, and
        animation.
      </p>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
        The goal is to compare how each model reasons about 3D space: how it
        composes meshes, structures reusable components, handles lighting and
        shadows, keeps rendering deterministic for server-side export, and
        balances visual ambition against performance. Open each tab to judge the
        results yourself.
      </p>

      <h2 className="mt-14 text-xs font-medium tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        SUBMISSIONS
      </h2>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {entries.map((entry) => (
          <li key={entry.href}>
            <Link
              href={entry.href}
              className="group flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <span>
                <span className="block text-sm font-medium text-black dark:text-white">
                  {entry.name}
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.model}
                </span>
              </span>
              <span className="text-zinc-400 transition group-hover:translate-x-0.5 dark:text-zinc-500">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-14 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
        Built with Next.js, React Three Fiber, and Three.js. Each scene is
        prerendered as a static page and deployed to GitHub Pages.
      </p>
    </div>
  );
}
