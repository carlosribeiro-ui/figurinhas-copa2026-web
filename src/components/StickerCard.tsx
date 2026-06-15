'use client';

import { Sticker, UserSticker } from '@/types';
import { getFlagUrl } from '@/constants/stickers';

interface StickerCardProps {
  sticker: Sticker;
  userSticker?: UserSticker;
  onPress: () => void;
  selectMode?: boolean;
  selected?: boolean;
}

const FWC_ICONS: Record<string, string> = {
  special: '🏆', stadium: '🏟️', legend: '⭐',
};

const FALTA_DISPLAY = {
  bg: 'bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-700',
  badge: 'Falta',
  badgeStyle: 'bg-red-600 text-white',
};

function resolveDisplay(userSticker?: UserSticker): { bg: string; badge: string; badgeStyle: string } | null {
  if (!userSticker) return FALTA_DISPLAY;
  const { status, quantity } = userSticker;
  const isHave = status === 'have' || status === 'duplicate';
  if (status === 'need') return {
    bg: 'bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-700',
    badge: 'Falta',
    badgeStyle: 'bg-red-600 text-white',
  };
  if (isHave && quantity >= 2) return {
    bg: 'bg-green-50 border-green-400 dark:bg-green-950 dark:border-green-600',
    badge: `+${quantity - 1}`,
    badgeStyle: 'bg-amber-500 text-white',
  };
  if (isHave) return {
    bg: 'bg-green-50 border-green-400 dark:bg-green-950 dark:border-green-600',
    badge: '✓',
    badgeStyle: 'bg-green-700 text-white',
  };
  return null;
}

export default function StickerCard({ sticker, userSticker, onPress, selectMode, selected }: StickerCardProps) {
  const display = resolveDisplay(userSticker);
  const flagUrl = getFlagUrl(sticker.country);
  const prefix = sticker.number.match(/^[A-Z]+/)?.[0] ?? '';
  const numOnly = sticker.number.replace(/^[A-Z]+/, '');

  return (
    <button
      onClick={onPress}
      className={`
        relative flex flex-col items-center justify-center gap-0.5
        border-2 rounded-lg p-1 lg:p-1.5 w-full aspect-square
        cursor-pointer transition-all duration-150 select-none
        hover:scale-105 active:scale-95 hover:shadow-md
        ${selected
          ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400 scale-105 shadow-md dark:bg-blue-900 dark:border-blue-400'
          : display
            ? display.bg
            : 'bg-white border-gray-200 hover:border-green-300 opacity-60 hover:opacity-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-green-500'
        }
      `}
    >
      {selectMode && (
        <span className={`
          absolute top-0.5 left-0.5 w-3 h-3 rounded-full border-2
          flex items-center justify-center text-[7px] font-black z-10
          ${selected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-500'}
        `}>
          {selected && '✓'}
        </span>
      )}

      {sticker.is_shiny && (
        <span className="absolute top-0 right-0.5 text-[8px] leading-none">✨</span>
      )}

      {prefix && (
        <span className="text-[9px] lg:text-[11px] font-black text-gray-500 dark:text-gray-400 leading-none tracking-tight">
          {prefix}
        </span>
      )}

      {flagUrl ? (
        <img
          src={flagUrl}
          alt={sticker.country}
          className="w-[55%] h-auto rounded-sm object-cover shadow-sm pointer-events-none"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className="text-lg lg:text-2xl leading-none">
          {FWC_ICONS[sticker.type] ?? '🏆'}
        </span>
      )}

      <span className="text-[10px] lg:text-[13px] font-extrabold text-gray-800 dark:text-gray-100 leading-none">
        {numOnly}
      </span>

      {display && !selectMode && (
        <span className={`text-[7px] lg:text-[9px] font-bold px-1 py-0 rounded-full leading-4 ${display.badgeStyle}`}>
          {display.badge}
        </span>
      )}
    </button>
  );
}
