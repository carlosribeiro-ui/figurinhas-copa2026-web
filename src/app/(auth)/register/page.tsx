'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    const result = await signUp(email, password, username, fullName);
    setLoading(false);

    if (result.error) {
      const msg = (result.error as any)?.message ?? '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (msg.toLowerCase().includes('username')) {
        setError('Este username já está em uso. Escolha outro.');
      } else {
        setError('Erro ao criar conta: ' + (msg || 'tente novamente.'));
      }
      return;
    }

    if (result.needsConfirmation) {
      setConfirmed(true); // Supabase enviou email de confirmação
      return;
    }

    router.push('/album');
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">⚽</div>
            <h1 className="text-3xl font-extrabold text-white">Figurinhas</h1>
            <p className="text-green-300 mt-1">Copa do Mundo 2026</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Confirme seu email</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enviamos um link de confirmação para <strong>{email}</strong>.<br />
              Clique no link para ativar sua conta e depois faça login.
            </p>
            <Link href="/login" className="inline-block bg-green-800 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm">
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="text-3xl font-extrabold text-white">Figurinhas</h1>
          <p className="text-green-300 mt-1">Copa do Mundo 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Criar conta</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Nome completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="João da Silva"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="joaosilva"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Só letras minúsculas, números e _ (sem espaços)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-green-700 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
