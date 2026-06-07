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

  async function markSticker(stickerId: number, status: 'have' | 'need' | 'duplicate') {
    if (!userId) return;
    const existing = userStickers[stickerId];
    if (existing) {
      await supabase
        .from('user_stickers')
        .update({ status, quantity: status === 'duplicate' ? (existing.quantity + 1) : 1 })
        .eq('user_id', userId)
        .eq('sticker_id', stickerId);
    } else {
      await supabase.from('user_stickers').insert({ user_id: userId, sticker_id: stickerId, status, quantity: 1 });
    }
    setUserStickers(prev => ({
      ...prev,
      [stickerId]: {
        user_id: userId,
        sticker_id: stickerId,
        quantity: status === 'duplicate' ? ((existing?.quantity ?? 0) + 1) : 1,
        status,
      },
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

  const haveIds = Object.values(userStickers).filter(s => s.status === 'have' || s.status === 'duplicate').map(s => s.sticker_id);
  const duplicateIds = Object.values(userStickers).filter(s => s.status === 'duplicate').map(s => s.sticker_id);
  const needIds = Object.values(userStickers).filter(s => s.status === 'need').map(s => s.sticker_id);

  return { userStickers, haveIds, duplicateIds, needIds, loading, markSticker, removeSticker, refresh: fetchStickers };
}
