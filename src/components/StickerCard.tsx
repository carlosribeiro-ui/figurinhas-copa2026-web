'use client';

import { Sticker, UserSticker } from '@/types';
import { COUNTRY_FLAGS } from '@/constants/stickers';

interface StickerCardProps {
  sticker: Sticker;
  userSticker?: UserSticker;
  onPress: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  have: 'bg-green-100 border-green-400 ring-2 ring-green-300',
  need: 'bg-red-50 border-red-300 ring-2 ring-red-200',
  duplicate: 'bg-amber-50 border-amber-400 ring-2 ring-amber-300',
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  have: { bg: 'bg-green-800', text: 'text-white', label: 'Tenho' },
  need: { bg: 'bg-red-600', text: 'text-white', label: 'Falta' },
  duplicate: { bg: 'bg-amber-500', text: 'text-white', label: 'Rep.' },
};

export default function StickerCard({ sticker, userSticker, onPress }: StickerCardProps) {
  const status = userSticker?.status;
  const flag = COUNTRY_FLAGS[sticker.country] ?? '🌍';

  return (
    <button
      onClick={onPress}
      className={`relative flex flex-col items-center justify-between border-2 rounded-xl p-2 cursor-pointer transition-all hover:scale-105 active:scale-95 w-full aspect-[3/4] ${
        status ? STATUS_STYLES[status] : 'bg-white border-gray-200 hover:border-green-300'
      } ${!status ? 'opacity-60' : ''}`}
    >
      {/* Shiny indicator */}
      {sticker.is_shiny && (
        <span className="absolute top-1 right-1 text-xs">✨</span>
      )}

      {/* Flag / icon */}
      <span className="text-2xl mt-1">{flag}</span>

      {/* Number */}
      <span className={`text-xs font-extrabold ${sticker.is_shiny ? 'text-yellow-600' : 'text-gray-700'}`}>
        {sticker.number}
      </span>

      {/* Name */}
      <span className="text-[10px] text-gray-500 text-center leading-tight line-clamp-2 px-0.5">
        {sticker.name}
      </span>

      {/* Status badge */}
      {status && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_BADGE[status].bg} ${STATUS_BADGE[status].text}`}>
          {STATUS_BADGE[status].label}
          {status === 'duplicate' && userSticker && userSticker.quantity > 1 ? ` ×${userSticker.quantity}` : ''}
        </span>
      )}
    </button>
  );
}
