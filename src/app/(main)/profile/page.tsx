'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/hooks/useStickers';
import ProgressBar from '@/components/ProgressBar';
import { TOTAL_STICKERS } from '@/constants/stickers';

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { haveIds, needIds, duplicateIds } = useStickers(user?.id);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const err = await updateProfile({ full_name: fullName, city });
    setSaving(false);
    if (err) { setError(err.message); }
    else setEditing(false);
  }

  const completionPct = TOTAL_STICKERS > 0 ? ((haveIds.length / TOTAL_STICKERS) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-green-800 rounded-2xl p-8 mb-6 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
          <span className="text-green-800 font-extrabold text-3xl">
            {(profile?.full_name || profile?.username || user?.email || '?')[0].toUpperCase()}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold">{profile?.full_name ?? profile?.username}</h1>
        <p className="text-green-300 mt-1">@{profile?.username}</p>
        <p className="text-green-400 text-sm mt-0.5">{user?.email}</p>
        {profile?.city && <p className="text-green-300 text-sm mt-1">📍 {profile.city}</p>}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-800 text-lg mb-4">Meu Progresso</h2>
        <ProgressBar
          current={haveIds.length}
          total={TOTAL_STICKERS}
          label={`Álbum completo: ${completionPct}%`}
        />
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-green-800">{haveIds.length}</p>
            <p className="text-sm text-gray-500 mt-1">Tenho</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-amber-500">{duplicateIds.length}</p>
            <p className="text-sm text-gray-500 mt-1">Repetidas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-red-600">{needIds.length}</p>
            <p className="text-sm text-gray-500 mt-1">Faltam</p>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800 text-lg">Informações</h2>
          {!editing && (
            <button
              onClick={() => { setFullName(profile?.full_name ?? ''); setCity(profile?.city ?? ''); setEditing(true); }}
              className="text-green-800 font-semibold text-sm hover:underline"
            >
              Editar
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Nome completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Seu nome"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-800 hover:bg-green-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:bg-green-300"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Nome</span>
              <span className="text-sm font-semibold text-gray-800">{profile?.full_name ?? '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Username</span>
              <span className="text-sm font-semibold text-gray-800">@{profile?.username}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Cidade</span>
              <span className="text-sm font-semibold text-gray-800">{profile?.city ?? '—'}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={signOut}
        className="w-full border-2 border-red-200 text-red-600 font-bold py-3 rounded-2xl hover:bg-red-50 transition-colors"
      >
        Sair da conta
      </button>
    </div>
  );
}
