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

function resolveDisplay(userSticker?: UserSticker): { bg: string; badge: string; badgeStyle: string } | null {
  if (!userSticker) return null;
  const { status, quantity } = userSticker;
  const isHave = status === 'have' || status === 'duplicate';
  if (status === 'need') return { bg: 'bg-red-50 border-red-300', badge: 'Falta', badgeStyle: 'bg-red-600 text-white' };
  if (isHave && quantity >= 2) return {
    bg: 'bg-green-50 border-green-400',
    badge: `Tenho +${quantity - 1}`,
    badgeStyle: 'bg-amber-500 text-white',
  };
  if (isHave) return { bg: 'bg-green-50 border-green-400', badge: 'Tenho', badgeStyle: 'bg-green-700 text-white' };
  return null;
}

export default function StickerCard({ sticker, userSticker, onPress, selectMode, selected }: StickerCardProps) {
  const display  = resolveDisplay(userSticker);
  const flagUrl  = getFlagUrl(sticker.country);
  const numOnly  = sticker.number.replace(/^[A-Z]+/, '');

  return (
    <button
      onClick={onPress}
      title={`${sticker.number} — ${sticker.name}`}
      className={`
        relative flex flex-col items-center justify-between
        border-2 rounded-xl p-1.5 w-full aspect-[3/4]
        cursor-pointer transition-all duration-150
        hover:scale-105 active:scale-95 hover:shadow-md
        ${selected
          ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400 scale-105 shadow-md'
          : display
            ? display.bg
            : 'bg-white border-gray-200 hover:border-green-300 opacity-60 hover:opacity-100'
        }
      `}
    >
      {/* Checkbox de seleção */}
      {selectMode && (
        <span className={`
          absolute top-1 left-1 w-4 h-4 rounded-full border-2
          flex items-center justify-center text-[9px] font-black z-10
          ${selected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-400'}
        `}>
          {selected && '✓'}
        </span>
      )}

      {/* Brilhante */}
      {sticker.is_shiny && (
        <span className="absolute top-0.5 right-0.5 text-[10px] leading-none">✨</span>
      )}

      {/* Bandeira ou ícone FWC */}
      {flagUrl ? (
        <img
          src={flagUrl}
          alt={sticker.country}
          className="w-8 h-auto rounded-sm object-cover mt-1 shadow-sm"
          loading="lazy"
        />
      ) : (
        <span className="text-xl leading-none mt-1">
          {FWC_ICONS[sticker.type] ?? '🏆'}
        </span>
      )}

      {/* Sigla FIFA */}
      <span className={`text-[11px] font-black tracking-wider leading-none
        ${sticker.is_shiny ? 'text-yellow-600' : 'text-gray-700'}`}>
        {sticker.code}
      </span>

      {/* Número */}
      <span className="text-base font-extrabold text-gray-800 leading-none">
        {numOnly}
      </span>

      {/* Badge de status */}
      {display && !selectMode && (
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none ${display.badgeStyle}`}>
          {display.badge}
        </span>
      )}
    </button>
  );
}
