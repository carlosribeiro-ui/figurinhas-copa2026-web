'use client';

import { useEffect } from 'react';
import { Sticker, UserSticker } from '@/types';
import { getFlagUrl } from '@/constants/stickers';

interface Props {
  visible: boolean;
  sticker: Sticker | null;
  userSticker?: UserSticker;
  onClose: () => void;
  onMark: (status: 'have' | 'need' | 'duplicate') => Promise<void>;
  onDecrementDuplicate: () => Promise<void>;
  onRemove: () => Promise<void>;
}

export default function StickerActionModal({ visible, sticker, userSticker, onClose, onMark, onDecrementDuplicate, onRemove }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (visible) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible || !sticker) return null;

  const flagUrl = getFlagUrl(sticker.country);
  const isHave = userSticker?.status === 'have' || userSticker?.status === 'duplicate';
  const extraCount = isHave ? Math.max(0, (userSticker?.quantity ?? 1) - 1) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {flagUrl
            ? <img src={flagUrl} alt={sticker.country} className="w-12 h-auto rounded shadow-sm" />
            : <span className="text-4xl">🏆</span>
          }
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">{sticker.number}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{sticker.section}</p>
          </div>
          {sticker.is_shiny && <span className="ml-auto text-xl">✨</span>}
        </div>

        {/* Status: Tenho / Falta */}
        <div className="space-y-2 mb-3">
          <button
            onClick={() => onMark('have')}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              isHave
                ? 'bg-green-800 text-white ring-2 ring-green-400'
                : 'bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900'
            }`}
          >
            ✅ Tenho esta figurinha
          </button>
          <button
            onClick={() => onMark('need')}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              userSticker?.status === 'need'
                ? 'bg-red-600 text-white ring-2 ring-red-300'
                : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900'
            }`}
          >
            ❌ Preciso desta figurinha
          </button>
        </div>

        {/* Repetidas — contador */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">🔁 Repetidas</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">
              {extraCount === 0 ? 'Nenhuma cópia extra' : `${extraCount} cópia${extraCount > 1 ? 's' : ''} extra`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDecrementDuplicate}
              disabled={extraCount === 0}
              className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-amber-800 dark:text-amber-300 font-black text-lg flex items-center justify-center transition-all"
            >
              −
            </button>
            <span className="w-7 text-center text-lg font-extrabold text-amber-800 dark:text-amber-300">{extraCount}</span>
            <button
              onClick={() => onMark('duplicate')}
              className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-black text-lg flex items-center justify-center transition-all"
            >
              +
            </button>
          </div>
        </div>

        {userSticker && (
          <button
            onClick={onRemove}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600 mb-1"
          >
            Remover marcação
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-2 w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
