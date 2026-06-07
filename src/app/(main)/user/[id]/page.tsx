'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/hooks/useStickers';
import ProgressBar from '@/components/ProgressBar';
import { Profile, UserSticker } from '@/types';
import { COPA_2026_STICKERS, getStickerById } from '@/constants/stickers';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { haveIds: myHaveIds, duplicateIds: myDuplicateIds } = useStickers(user?.id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theirStickers, setTheirStickers] = useState<Record<number, UserSticker>>({});
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [proposed, setProposed] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    fetchData();
  }, [userId]);

  async function fetchData() {
    const [{ data: prof }, { data: stickers }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_stickers').select('*').eq('user_id', userId),
    ]);
    setProfile(prof);
    if (stickers) {
      const map: Record<number, UserSticker> = {};
      stickers.forEach(s => { map[s.sticker_id] = s; });
      setTheirStickers(map);
    }
    setLoading(false);
  }

  const theirHave = Object.values(theirStickers)
    .filter(s => s.status === 'have' || s.status === 'duplicate')
    .map(s => s.sticker_id);

  // their duplicates: legacy status='duplicate' OR have with quantity >= 2
  const theirDups = Object.values(theirStickers)
    .filter(s => s.status === 'duplicate' || (s.status === 'have' && (s.quantity ?? 1) >= 2))
    .map(s => s.sticker_id);

  // they can offer me: their duplicates I don't have
  const theyCanOffer = theirDups.filter(id => !myHaveIds.includes(id));
  // I can offer them: my duplicates they don't have
  const canOfferDups = myDuplicateIds.filter(id => !theirHave.includes(id));

  async function proposeTrade() {
    if (!user || canOfferDups.length === 0 || theyCanOffer.length === 0) return;
    setProposing(true);
    await supabase.from('trade_proposals').insert({
      sender_id: user.id,
      receiver_id: userId,
      sender_offers: canOfferDups,
      receiver_wants: theyCanOffer,
      status: 'pending',
    });
    setProposing(false);
    setProposed(true);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-4xl animate-spin">⚽</div>
      </div>
    );
  }

  if (!profile) return <div className="p-6 text-gray-500">Usuário não encontrado.</div>;

  const hasCompatibility = theyCanOffer.length > 0 || canOfferDups.length > 0;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-green-800 dark:text-green-400 font-semibold text-sm hover:underline mb-5 flex items-center gap-1">
        ← Voltar
      </button>

      {/* Profile header */}
      <div className="bg-green-800 rounded-2xl p-8 mb-6 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
          <span className="text-green-800 font-extrabold text-3xl">
            {(profile.full_name || profile.username || '?')[0].toUpperCase()}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold">{profile.full_name || profile.username || 'Usuário'}</h1>
        <p className="text-green-300 mt-1">@{profile.username ?? '—'}</p>
        {profile.city && <p className="text-green-300 text-sm mt-1">📍 {profile.city}</p>}
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-5">
        <ProgressBar
          current={theirHave.length}
          total={COPA_2026_STICKERS.length}
          label={`${theirHave.length} / ${COPA_2026_STICKERS.length} figurinhas`}
        />
      </div>

      {/* Trade compatibility */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-5">
        <h2 className="font-bold text-gray-800 dark:text-white mb-1">Compatibilidade de Troca</h2>
        <p className="text-xs text-gray-400 mb-4">Somente repetidas contam — figurinha já colada no álbum não serve para trocar</p>

        {!hasCompatibility ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-3xl mb-2">🔄</p>
            <p className="text-sm font-semibold">Nenhuma repetida compatível ainda</p>
            <p className="text-xs mt-1">Marque figurinhas como repetidas no álbum para habilitar trocas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
              <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-2">
                🟢 Repetidas deles que você não tem ({theyCanOffer.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {theyCanOffer.slice(0, 12).map(id => (
                  <span key={id} className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-0.5 rounded">
                    {getStickerById(id)?.number ?? id}
                  </span>
                ))}
                {theyCanOffer.length > 12 && <span className="text-xs text-gray-400">+{theyCanOffer.length - 12}</span>}
                {theyCanOffer.length === 0 && <span className="text-xs text-gray-400 italic">Nenhuma</span>}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">
                🟡 Suas repetidas que eles não têm ({canOfferDups.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {canOfferDups.slice(0, 12).map(id => (
                  <span key={id} className="bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded">
                    {getStickerById(id)?.number ?? id}
                  </span>
                ))}
                {canOfferDups.length > 12 && <span className="text-xs text-gray-400">+{canOfferDups.length - 12}</span>}
                {canOfferDups.length === 0 && <span className="text-xs text-gray-400 italic">Nenhuma</span>}
              </div>
            </div>
          </div>
        )}

        {!proposed ? (
          <button
            onClick={proposeTrade}
            disabled={proposing || canOfferDups.length === 0 || theyCanOffer.length === 0}
            className="mt-5 w-full bg-green-800 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {proposing
              ? 'Enviando proposta...'
              : canOfferDups.length === 0 && theyCanOffer.length === 0
              ? 'Marque repetidas no álbum para propor troca'
              : canOfferDups.length === 0
              ? 'Você não tem repetidas para oferecer'
              : theyCanOffer.length === 0
              ? 'Eles não têm repetidas que você precisa'
              : `🔄 Propor troca (${canOfferDups.length} suas × ${theyCanOffer.length} deles)`}
          </button>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="bg-green-50 border border-green-200 text-green-700 font-semibold text-center py-3 rounded-xl">
              Proposta enviada! 🎉 Aguarde a resposta em Trocas.
            </div>
            <button
              onClick={() => router.push('/trades')}
              className="w-full border border-green-300 text-green-700 dark:text-green-400 font-bold py-2.5 rounded-xl hover:bg-green-50 transition-colors text-sm"
            >
              🔄 Ver minhas propostas de troca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
