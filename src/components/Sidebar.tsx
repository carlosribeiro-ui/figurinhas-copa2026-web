'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';


const NAV = [
  { href: '/album',   icon: '📚', label: 'Meu Álbum'  },
  { href: '/explore', icon: '🔍', label: 'Explorar'   },
  { href: '/trades',  icon: '🔄', label: 'Trocas'     },
  { href: '/chat',    icon: '💬', label: 'Chat'        },
  { href: '/profile', icon: '👤', label: 'Perfil'     },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { toggle } = useTheme();

  return (
    <aside className={`
      fixed left-0 top-0 bottom-0 z-30 w-64
      bg-green-800 dark:bg-gray-900 dark:border-r dark:border-gray-700 flex flex-col
      transition-transform duration-300 ease-in-out
      lg:translate-x-0
      ${open ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-green-700 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚽</span>
          <div>
            <p className="text-white font-extrabold text-base leading-tight">Figurinhas</p>
            <p className="text-green-300 dark:text-gray-400 text-xs">Copa 2026</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-green-300 hover:text-white p-1 rounded"
          aria-label="Fechar menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-white text-green-800 shadow-md'
                  : 'text-green-100 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Dark mode toggle — usa CSS dark: para evitar hydration mismatch */}
      <div className="px-4 pb-2">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold
            text-green-100 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-gray-700 transition-all"
        >
          {/* Ícone: lua no modo claro, sol no modo escuro */}
          <span className="text-lg dark:hidden">🌙</span>
          <span className="text-lg hidden dark:block">☀️</span>
          <span className="dark:hidden">Modo escuro</span>
          <span className="hidden dark:block">Modo claro</span>
        </button>
      </div>

      {/* Rodapé do usuário */}
      <div className="px-4 py-4 border-t border-green-700 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-green-800 font-extrabold text-sm">
              {(profile?.full_name || profile?.username || '?')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {profile?.full_name || profile?.username || 'Usuário'}
            </p>
            <p className="text-green-300 dark:text-gray-400 text-xs truncate">@{profile?.username}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full text-xs text-green-300 dark:text-gray-400 hover:text-red-300 font-semibold py-1 transition-colors text-left px-1"
        >
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
