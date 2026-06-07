'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/hooks/useStickers';
import StickerCard from '@/components/StickerCard';
import StickerActionModal from '@/components/StickerActionModal';
import ProgressBar from '@/components/ProgressBar';
import { COPA_2026_STICKERS, SECTIONS, TOTAL_STICKERS } from '@/constants/stickers';
import { Sticker } from '@/types';

type FilterType = 'all' | 'have' | 'need' | 'duplicate' | 'unmarked';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todas', have: 'Tenho', need: 'Faltam', duplicate: 'Repetidas', unmarked: 'Sem marca',
};

export default function AlbumPage() {
  const { user } = useAuth();
  const { userStickers, haveIds, needIds, duplicateIds, markSticker, removeSticker } = useStickers(user?.id);
  const [selectedSection, setSelectedSection] = useState('Todos');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [modalSticker, setModalSticker] = useState<Sticker | null>(null);

  const sections = ['Todos', ...SECTIONS];

  const filtered = useMemo(() => {
    let stickers = COPA_2026_STICKERS;
    if (selectedSection !== 'Todos') stickers = stickers.filter(s => s.section === selectedSection);
    if (search) stickers = stickers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.number.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === 'have') stickers = stickers.filter(s => haveIds.includes(s.id));
    if (filter === 'need') stickers = stickers.filter(s => needIds.includes(s.id));
    if (filter === 'duplicate') stickers = stickers.filter(s => duplicateIds.includes(s.id));
    if (filter === 'unmarked') stickers = stickers.filter(s => !userStickers[s.id]);
    return stickers;
  }, [selectedSection, filter, search, userStickers, haveIds, needIds, duplicateIds]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top stats bar */}
      <div className="bg-green-800 text-white px-6 py-4">
        <div className="flex items-center gap-8 mb-3">
          <div className="text-center">
            <p className="text-2xl font-extrabold">{haveIds.length}</p>
            <p className="text-xs text-green-300">Tenho</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-amber-300">{duplicateIds.length}</p>
            <p className="text-xs text-green-300">Repetidas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-red-300">{needIds.length}</p>
            <p className="text-xs text-green-300">Faltam</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-300">{TOTAL_STICKERS - haveIds.length - needIds.length}</p>
            <p className="text-xs text-green-300">Não marc.</p>
          </div>
          <div className="flex-1 max-w-xs">
            <ProgressBar
              current={haveIds.length}
              total={TOTAL_STICKERS}
              label={`${haveIds.length} / ${TOTAL_STICKERS} figurinhas`}
              color="#4ade80"
            />
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar figurinha por nome ou número..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-lg bg-green-700 text-white placeholder-green-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 items-center border-r border-gray-200 pr-3 mr-1 flex-shrink-0">
          {(['all', 'have', 'need', 'duplicate', 'unmarked'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        {sections.map(sec => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              selectedSection === sec ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">Nenhuma figurinha encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2">
            {filtered.map(sticker => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                userSticker={userStickers[sticker.id]}
                onPress={() => setModalSticker(sticker)}
              />
            ))}
          </div>
        )}
      </div>

      <StickerActionModal
        visible={!!modalSticker}
        sticker={modalSticker}
        userSticker={modalSticker ? userStickers[modalSticker.id] : undefined}
        onClose={() => setModalSticker(null)}
        onMark={async status => {
          if (modalSticker) await markSticker(modalSticker.id, status);
          setModalSticker(null);
        }}
        onRemove={async () => {
          if (modalSticker) await removeSticker(modalSticker.id);
          setModalSticker(null);
        }}
      />
    </div>
  );
}
