'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/album',   icon: '📚', label: 'Meu Álbum'  },
  { href: '/explore', icon: '🔍', label: 'Explorar'   },
  { href: '/trades',  icon: '🔄', label: 'Trocas'     },
  { href: '/chat',    icon: '💬', label: 'Chat'        },
  { href: '/profile', icon: '👤', label: 'Perfil'     },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-green-800 flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚽</span>
          <div>
            <p className="text-white font-extrabold text-base leading-tight">Figurinhas</p>
            <p className="text-green-300 text-xs">Copa 2026</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-white text-green-800 shadow-md'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-green-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <span className="text-green-800 font-extrabold text-sm">
              {(profile?.full_name ?? profile?.username ?? '?')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {profile?.full_name ?? profile?.username ?? 'Usuário'}
            </p>
            <p className="text-green-300 text-xs truncate">@{profile?.username}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full text-xs text-green-300 hover:text-red-300 font-semibold py-1 transition-colors text-left px-1"
        >
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
