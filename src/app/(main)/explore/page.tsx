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
  needIds: number[];
  matchScore: number;
  theyHaveIWant: number;
  iHaveTheyWant: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { haveIds: myHaveIds, needIds: myNeedIds, duplicateIds: myDuplicateIds } = useStickers(user?.id);
  const [users, setUsers] = useState<UserWithStickers[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, [myHaveIds.length, myNeedIds.length]);

  async function fetchUsers() {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles').select('*').neq('id', user?.id ?? '').limit(50);

    if (!profiles) { setLoading(false); return; }

    const enriched: UserWithStickers[] = await Promise.all(
      profiles.map(async profile => {
        const { data: stickers } = await supabase
          .from('user_stickers').select('sticker_id, status').eq('user_id', profile.id);
        const theirHave = stickers?.filter(s => s.status === 'have' || s.status === 'duplicate').map(s => s.sticker_id) ?? [];
        const theirNeed = stickers?.filter(s => s.status === 'need').map(s => s.sticker_id) ?? [];
        const theyHaveIWant = theirHave.filter(id => myNeedIds.includes(id)).length;
        const iHaveTheyWant = myDuplicateIds.filter(id => theirNeed.includes(id)).length;
        return { profile, haveIds: theirHave, needIds: theirNeed, matchScore: theyHaveIWant + iHaveTheyWant, theyHaveIWant, iHaveTheyWant };
      })
    );

    enriched.sort((a, b) => b.matchScore - a.matchScore);
    setUsers(enriched);
    setLoading(false);
  }

  const filtered = search
    ? users.filter(u =>
        u.profile.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.profile.full_name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Explorar Colecionadores</h1>
        <p className="text-gray-500 text-sm mt-1">Encontre pessoas para trocar figurinhas</p>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou username..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              onClick={() => router.push(`/user/${item.profile.id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 cursor-pointer hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-lg">
                  {(item.profile.full_name ?? item.profile.username)[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-800">{item.profile.full_name ?? item.profile.username}</p>
                    <p className="text-xs text-gray-400">@{item.profile.username}</p>
                    {item.profile.city && <p className="text-xs text-gray-400 mt-0.5">📍 {item.profile.city}</p>}
                  </div>
                  {item.matchScore > 0 && (
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                        {item.matchScore} compatíveis
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {item.theyHaveIWant > 0 && (
                    <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg">
                      🟢 Tem {item.theyHaveIWant} que você precisa
                    </span>
                  )}
                  {item.iHaveTheyWant > 0 && (
                    <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded-lg">
                      🟡 Precisa de {item.iHaveTheyWant} que você tem
                    </span>
                  )}
                  {item.matchScore === 0 && (
                    <span className="text-xs text-gray-400 italic">Nenhuma troca compatível ainda</span>
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
