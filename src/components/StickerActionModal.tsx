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
  onRemove: () => Promise<void>;
}

export default function StickerActionModal({ visible, sticker, userSticker, onClose, onMark, onRemove }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (visible) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible || !sticker) return null;

  const flagUrl = getFlagUrl(sticker.country);

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

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onMark('have')}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              userSticker?.status === 'have'
                ? 'bg-green-800 text-white ring-2 ring-green-400'
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`}
          >
            ✅ Tenho esta figurinha
          </button>
          <button
            onClick={() => onMark('duplicate')}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              userSticker?.status === 'duplicate'
                ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🔁 Tenho repetida{userSticker?.status === 'duplicate' ? ` (×${userSticker.quantity})` : ''}
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

          {userSticker && (
            <button
              onClick={onRemove}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all border border-gray-200"
            >
              Remover marcação
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
