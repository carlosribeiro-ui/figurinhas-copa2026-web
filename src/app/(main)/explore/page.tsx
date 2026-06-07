'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/hooks/useStickers';
import ProgressBar from '@/components/ProgressBar';
import { Profile } from '@/types';
import { COPA_2026_STICKERS } from '@/constants/stickers';

interface UserWithStickers {
  profile: Profile;
  haveIds: number[];
  dupIds: number[];
  matchScore: number;
  theyHaveIWant: number;
  iHaveTheyWant: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { haveIds: myHaveIds, duplicateIds: myDuplicateIds } = useStickers(user?.id);
  const [users, setUsers] = useState<UserWithStickers[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, [myHaveIds.length, myDuplicateIds.length]);

  async function fetchUsers() {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles').select('*').neq('id', user?.id ?? '').limit(50);

    if (!profiles) { setLoading(false); return; }

    const enriched: UserWithStickers[] = await Promise.all(
      profiles.map(async profile => {
        const { data: stickers } = await supabase
          .from('user_stickers').select('sticker_id, status, quantity').eq('user_id', profile.id);
        const theirHave = stickers?.filter(s => s.status === 'have' || s.status === 'duplicate').map(s => s.sticker_id) ?? [];
        // duplicates: legacy status='duplicate' OR have with quantity >= 2
        const theirDups = stickers?.filter(s =>
          s.status === 'duplicate' || (s.status === 'have' && (s.quantity ?? 1) >= 2)
        ).map(s => s.sticker_id) ?? [];
        // they can offer me: their duplicates that I don't have
        const theyHaveIWant = theirDups.filter(id => !myHaveIds.includes(id)).length;
        // I can offer them: my duplicates that they don't have
        const iHaveTheyWant = myDuplicateIds.filter(id => !theirHave.includes(id)).length;
        return { profile, haveIds: theirHave, dupIds: theirDups, matchScore: theyHaveIWant + iHaveTheyWant, theyHaveIWant, iHaveTheyWant };
      })
    );

    enriched.sort((a, b) => b.matchScore - a.matchScore);
    setUsers(enriched);
    setLoading(false);
  }

  const filtered = search
    ? users.filter(u =>
        (u.profile.username ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.profile.full_name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Explorar Colecionadores</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Encontre pessoas para trocar figurinhas</p>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou username..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:!text-gray-100 rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-4xl animate-spin">⚽</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.profile.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 hover:shadow-md hover:border-green-200 dark:hover:border-green-700 transition-all"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-extrabold text-lg">
                    {(item.profile.full_name || item.profile.username || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">{item.profile.full_name || item.profile.username || 'Usuário'}</p>
                      <p className="text-xs text-gray-400">@{item.profile.username ?? '—'}</p>
                      {item.profile.city && <p className="text-xs text-gray-400 mt-0.5">📍 {item.profile.city}</p>}
                    </div>
                    {item.matchScore > 0 && (
                      <div className="text-right flex-shrink-0">
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-full">
                          {item.matchScore} repetidas compatíveis
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.theyHaveIWant > 0 && (
                      <span className="bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-lg">
                        🟢 Tem {item.theyHaveIWant} repetida que você não tem
                      </span>
                    )}
                    {item.iHaveTheyWant > 0 && (
                      <span className="bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold px-2 py-1 rounded-lg">
                        🟡 Você tem {item.iHaveTheyWant} repetida que ele não tem
                      </span>
                    )}
                    {item.theyHaveIWant === 0 && item.iHaveTheyWant === 0 && (
                      <span className="text-xs text-gray-400 italic">Nenhuma repetida compatível</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <ProgressBar
                      current={item.haveIds.length}
                      total={COPA_2026_STICKERS.length}
                      label={`${item.haveIds.length} figurinhas`}
                    />
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => router.push(`/user/${item.profile.id}`)}
                  className="w-full bg-green-800 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  {item.matchScore > 0 ? '🔄 Ver perfil e propor troca' : '👤 Ver perfil'}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-semibold">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
