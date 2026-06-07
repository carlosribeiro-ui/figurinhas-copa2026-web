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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {flagUrl
            ? <img src={flagUrl} alt={sticker.country} className="w-12 h-auto rounded shadow-sm" />
            : <span className="text-4xl">🏆</span>
          }
          <div>
            <p className="text-xs text-gray-400 font-semibold">{sticker.number}</p>
            <p className="font-bold text-gray-800 text-base leading-tight">{sticker.name}</p>
            <p className="text-xs text-gray-500">{sticker.section}</p>
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
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`}
          >
            ✅ Tenho esta figurinha
          </button>
          <button
            onClick={() => onMark('need')}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              userSticker?.status === 'need'
                ? 'bg-red-600 text-white ring-2 ring-red-300'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            ❌ Preciso desta figurinha
          </button>
        </div>

        {/* Repetidas — contador separado */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">🔁 Repetidas</p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              {extraCount === 0 ? 'Nenhuma cópia extra' : `${extraCount} cópia${extraCount > 1 ? 's' : ''} extra`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDecrementDuplicate}
              disabled={extraCount === 0}
              className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-amber-800 font-black text-lg flex items-center justify-center transition-all"
            >
              −
            </button>
            <span className="w-7 text-center text-lg font-extrabold text-amber-800">{extraCount}</span>
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
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all border border-gray-200 mb-1"
          >
            Remover marcação
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-2 w-full text-center text-sm text-gray-400 hover:text-gray-600 font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
