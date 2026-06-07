'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/album',   icon: '📚', label: 'Álbum'    },
  { href: '/explore', icon: '🔍', label: 'Explorar' },
  { href: '/trades',  icon: '🔄', label: 'Trocas'   },
  { href: '/chat',    icon: '💬', label: 'Chat'      },
  { href: '/profile', icon: '👤', label: 'Perfil'   },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex flex-shrink-0">
      {NAV.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active
                ? 'text-green-800 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className={`text-[10px] font-bold ${active ? 'text-green-800 dark:text-green-400' : 'text-gray-400'}`}>
              {item.label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-green-700 rounded-t-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
