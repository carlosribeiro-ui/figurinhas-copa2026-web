'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserSticker } from '@/types';

export function useStickers(userId: string | undefined) {
  const [userStickers, setUserStickers] = useState<Record<number, UserSticker>>({});
  const [loading, setLoading] = useState(true);

  const fetchStickers = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase.from('user_stickers').select('*').eq('user_id', userId);
    if (data) {
      const map: Record<number, UserSticker> = {};
      data.forEach(s => { map[s.sticker_id] = s; });
      setUserStickers(map);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchStickers(); }, [fetchStickers]);

  async function markSticker(stickerId: number, action: 'have' | 'need' | 'duplicate') {
    if (!userId) return;
    const existing = userStickers[stickerId];

    if (action === 'duplicate') {
      // Adiciona uma cópia extra — sempre mantém status 'have'
      const newQty = (existing?.quantity ?? 1) + 1;
      if (existing) {
        await supabase.from('user_stickers')
          .update({ status: 'have', quantity: newQty })
          .eq('user_id', userId).eq('sticker_id', stickerId);
      } else {
        await supabase.from('user_stickers')
          .insert({ user_id: userId, sticker_id: stickerId, status: 'have', quantity: 2 });
      }
      setUserStickers(prev => ({
        ...prev,
        [stickerId]: { user_id: userId, sticker_id: stickerId, status: 'have', quantity: existing ? newQty : 2 },
      }));
      return;
    }

    if (action === 'have') {
      // Marca como "tenho" — preserva quantity se já tem extras
      const qty = Math.max(1, existing?.quantity ?? 1);
      if (existing) {
        await supabase.from('user_stickers')
          .update({ status: 'have', quantity: qty })
          .eq('user_id', userId).eq('sticker_id', stickerId);
      } else {
        await supabase.from('user_stickers')
          .insert({ user_id: userId, sticker_id: stickerId, status: 'have', quantity: 1 });
      }
      setUserStickers(prev => ({
        ...prev,
        [stickerId]: { user_id: userId, sticker_id: stickerId, status: 'have', quantity: existing ? qty : 1 },
      }));
      return;
    }

    // action === 'need'
    if (existing) {
      await supabase.from('user_stickers')
        .update({ status: 'need', quantity: 1 })
        .eq('user_id', userId).eq('sticker_id', stickerId);
    } else {
      await supabase.from('user_stickers')
        .insert({ user_id: userId, sticker_id: stickerId, status: 'need', quantity: 1 });
    }
    setUserStickers(prev => ({
      ...prev,
      [stickerId]: { user_id: userId, sticker_id: stickerId, status: 'need', quantity: 1 },
    }));
  }

  async function decrementDuplicate(stickerId: number) {
    if (!userId) return;
    const existing = userStickers[stickerId];
    if (!existing || existing.quantity <= 1) return;
    const newQty = existing.quantity - 1;
    await supabase.from('user_stickers')
      .update({ quantity: newQty })
      .eq('user_id', userId).eq('sticker_id', stickerId);
    setUserStickers(prev => ({
      ...prev,
      [stickerId]: { ...prev[stickerId], quantity: newQty },
    }));
  }

  async function removeSticker(stickerId: number) {
    if (!userId) return;
    await supabase.from('user_stickers').delete().eq('user_id', userId).eq('sticker_id', stickerId);
    setUserStickers(prev => {
      const next = { ...prev };
      delete next[stickerId];
      return next;
    });
  }

  // haveIds: status 'have' (inclui legado 'duplicate')
  const haveIds = Object.values(userStickers)
    .filter(s => s.status === 'have' || s.status === 'duplicate')
    .map(s => s.sticker_id);

  // duplicateIds: tem extras (quantity >= 2) ou registro legado 'duplicate'
  const duplicateIds = Object.values(userStickers)
    .filter(s => s.status === 'duplicate' || (s.status === 'have' && s.quantity >= 2))
    .map(s => s.sticker_id);

  const needIds = Object.values(userStickers)
    .filter(s => s.status === 'need')
    .map(s => s.sticker_id);

  return { userStickers, haveIds, duplicateIds, needIds, loading, markSticker, decrementDuplicate, removeSticker, refresh: fetchStickers };
}
