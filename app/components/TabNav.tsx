'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Qwen3 Coder Next', href: '/qwen3coder' },
  { name: 'Gemini 4', href: '/gemini' },
  { name: '6.1 Sol', href: '/sol' },
  { name: 'Opus 5.5', href: '/opus' },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-6 border-b border-zinc-200 pb-5 dark:border-zinc-800">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`
            -mb-px border-b-2 px-1 pt-1 text-sm font-medium leading-5
            ${
              pathname === tab.href
                ? 'border-black dark:border-white'
                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300'
            }
          `}
        >
          {tab.name}
        </Link>
      ))}
    </nav>
  );
}
