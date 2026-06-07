'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [ready, setReady]           = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    // Supabase detecta o token de recovery no hash da URL automaticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError('Não foi possível redefinir a senha. Solicite um novo link.');
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/album'), 2500);
    }
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
          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Senha redefinida!</h2>
              <p className="text-sm text-gray-500">Redirecionando para o álbum...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🔗</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Verificando link...</h2>
              <p className="text-sm text-gray-500 mb-6">
                Se você chegou aqui por acidente, volte ao login.
              </p>
              <Link href="/login" className="text-green-700 font-semibold hover:underline text-sm">
                ← Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Nova senha</h2>
              <p className="text-sm text-gray-500 mb-6">Escolha uma nova senha para sua conta.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Nova senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Confirmar senha</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-800 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
