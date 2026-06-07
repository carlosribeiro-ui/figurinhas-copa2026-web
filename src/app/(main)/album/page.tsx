'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/hooks/useStickers';
import StickerCard from '@/components/StickerCard';
import StickerActionModal from '@/components/StickerActionModal';
import ProgressBar from '@/components/ProgressBar';
import { COPA_2026_STICKERS, SECTIONS, COUNTRIES, TOTAL_STICKERS, COUNTRY_CODES, getFlagUrl } from '@/constants/stickers';
import { Sticker } from '@/types';

type FilterType = 'all' | 'have' | 'need' | 'unmarked';
type AlbumTab  = 'album' | 'duplicates';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todas', have: 'Tenho', need: 'Faltam', unmarked: 'Sem marca',
};

const TEAM_COUNTRIES = COUNTRIES.filter(c => !['ABERTURA', 'SEDES', 'LENDAS'].includes(c));

export default function AlbumPage() {
  const { user } = useAuth();
  const { userStickers, haveIds, needIds, duplicateIds, markSticker, decrementDuplicate, clearExtraDuplicates, removeSticker } = useStickers(user?.id);

  const [albumTab, setAlbumTab]               = useState<AlbumTab>('album');
  const [selectedSection, setSelectedSection] = useState('Todos');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [filter, setFilter]                   = useState<FilterType>('all');
  const [search, setSearch]                   = useState('');
  const [modalSticker, setModalSticker]       = useState<Sticker | null>(null);

  const [selectMode, setSelectMode]   = useState(false);
  const [selected, setSelected]       = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const sections = ['Todos', ...SECTIONS];

  const filtered = useMemo(() => {
    let stickers = COPA_2026_STICKERS;
    if (selectedCountry)                  stickers = stickers.filter(s => s.country === selectedCountry);
    else if (selectedSection !== 'Todos') stickers = stickers.filter(s => s.section === selectedSection);
    if (search) stickers = stickers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.number.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === 'have')    stickers = stickers.filter(s => haveIds.includes(s.id));
    if (filter === 'need')    stickers = stickers.filter(s => needIds.includes(s.id));
    if (filter === 'unmarked') stickers = stickers.filter(s => !userStickers[s.id]);
    return stickers;
  }, [selectedSection, selectedCountry, filter, search, userStickers, haveIds, needIds]);

  const duplicateStickers = useMemo(() =>
    COPA_2026_STICKERS.filter(s => duplicateIds.includes(s.id)),
    [duplicateIds]
  );

  const totalExtras = useMemo(() =>
    duplicateStickers.reduce((sum, s) => sum + Math.max(0, (userStickers[s.id]?.quantity ?? 2) - 1), 0),
    [duplicateStickers, userStickers]
  );

  // Lista ativa para seleção (depende da aba)
  const activeList = albumTab === 'duplicates' ? duplicateStickers : filtered;

  function selectCountry(country: string) {
    setSelectedCountry(country);
    if (country) setSelectedSection('Todos');
  }

  function selectSection(sec: string) {
    setSelectedSection(sec);
    setSelectedCountry('');
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === activeList.length) setSelected(new Set());
    else setSelected(new Set(activeList.map(s => s.id)));
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function switchTab(tab: AlbumTab) {
    setAlbumTab(tab);
    exitSelectMode();
  }

  async function bulkMark(status: 'have' | 'need' | 'duplicate') {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all(Array.from(selected).map(id => markSticker(id, status)));
    setBulkLoading(false);
    exitSelectMode();
  }

  async function bulkRemove() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all(Array.from(selected).map(id => removeSticker(id)));
    setBulkLoading(false);
    exitSelectMode();
  }

  async function bulkDecrementDuplicate() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all(Array.from(selected).map(id => decrementDuplicate(id)));
    setBulkLoading(false);
    exitSelectMode();
  }

  async function bulkClearExtras() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all(Array.from(selected).map(id => clearExtraDuplicates(id)));
    setBulkLoading(false);
    exitSelectMode();
  }

  function handleCardPress(sticker: Sticker) {
    if (selectMode) toggleSelect(sticker.id);
    else setModalSticker(sticker);
  }

  const selectedFlagUrl = selectedCountry ? getFlagUrl(selectedCountry) : null;
  const selectedCode    = selectedCountry ? (COUNTRY_CODES[selectedCountry] ?? '') : '';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* ── Stats bar ── */}
      <div className="bg-green-800 dark:bg-gray-800 text-white px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-6 mb-3 flex-wrap">
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold">{haveIds.length}</p>
            <p className="text-[10px] sm:text-xs text-green-300 dark:text-gray-400">Tenho</p>
          </div>
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold text-amber-300">{duplicateIds.length}</p>
            <p className="text-[10px] sm:text-xs text-green-300 dark:text-gray-400">Repetidas</p>
          </div>
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold text-red-300">{needIds.length}</p>
            <p className="text-[10px] sm:text-xs text-green-300 dark:text-gray-400">Faltam</p>
          </div>
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold text-gray-300">
              {TOTAL_STICKERS - haveIds.length - needIds.length}
            </p>
            <p className="text-[10px] sm:text-xs text-green-300 dark:text-gray-400">Não marc.</p>
          </div>
          <div className="flex-1 min-w-[80px]">
            <ProgressBar current={haveIds.length} total={TOTAL_STICKERS} label={`${haveIds.length} / ${TOTAL_STICKERS}`} color="#4ade80" />
          </div>

          {/* Botão selecionar */}
          <button
            onClick={() => { setSelectMode(v => !v); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
              selectMode
                ? 'bg-white text-green-800'
                : 'bg-green-700 dark:bg-gray-700 text-white hover:bg-green-600 dark:hover:bg-gray-600'
            }`}
          >
            {selectMode ? '✕ Cancelar' : '☑ Selecionar'}
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-1 bg-green-900/40 dark:bg-gray-900/40 rounded-xl p-1 w-fit">
          <button
            onClick={() => switchTab('album')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              albumTab === 'album' ? 'bg-white text-green-800 shadow' : 'text-green-200 dark:text-gray-400 hover:text-white'
            }`}
          >
            📚 Álbum
          </button>
          <button
            onClick={() => switchTab('duplicates')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
              albumTab === 'duplicates' ? 'bg-white text-green-800 shadow' : 'text-green-200 dark:text-gray-400 hover:text-white'
            }`}
          >
            🔁 Repetidas
            {duplicateIds.length > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-white">
                {duplicateIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {albumTab === 'duplicates' ? (
        /* ══════════════════════════════════════
           ABA REPETIDAS
        ══════════════════════════════════════ */
        <>
          {/* Info de seleção */}
          {selectMode && (
            <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900 px-4 py-2 flex items-center gap-3">
              <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
                {selected.size === 0
                  ? 'Clique nas figurinhas para selecioná-las'
                  : `${selected.size} selecionada${selected.size > 1 ? 's' : ''}`}
              </span>
              <button onClick={toggleSelectAll} className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 underline">
                {selected.size === duplicateStickers.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {duplicateStickers.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-5xl mb-3">🔁</p>
                <p className="font-bold text-lg text-gray-600 dark:text-gray-400">Nenhuma figurinha repetida</p>
                <p className="text-sm mt-1">Use o botão + no modal de cada figurinha para marcar repetidas</p>
              </div>
            ) : (
              <>
                {/* Resumo */}
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 mb-5 flex items-center gap-4">
                  <span className="text-3xl">🔁</span>
                  <div>
                    <p className="font-extrabold text-amber-800 dark:text-amber-300 text-lg">
                      {duplicateIds.length} tipo{duplicateIds.length > 1 ? 's' : ''} com repetição
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-500">
                      {totalExtras} cópia{totalExtras !== 1 ? 's' : ''} extra disponíve{totalExtras !== 1 ? 'is' : 'l'} para troca
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 gap-1.5 sm:gap-2">
                  {duplicateStickers.map(sticker => (
                    <div key={sticker.id} className="relative">
                      <StickerCard
                        sticker={sticker}
                        userSticker={userStickers[sticker.id]}
                        onPress={() => handleCardPress(sticker)}
                        selectMode={selectMode}
                        selected={selected.has(sticker.id)}
                      />
                      {!selectMode && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow z-10">
                          +{Math.max(0, (userStickers[sticker.id]?.quantity ?? 2) - 1)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Barra de ações em massa — Repetidas */}
          {selectMode && selected.size > 0 && (
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                {selected.size} selecionada{selected.size > 1 ? 's' : ''}
              </span>
              <button onClick={bulkDecrementDuplicate} disabled={bulkLoading}
                className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition-all">
                🔁 −1 cópia
              </button>
              <button onClick={bulkClearExtras} disabled={bulkLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition-all">
                🗑 Zerar extras
              </button>
              <button onClick={bulkRemove} disabled={bulkLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition-all">
                ✕ Remover tudo
              </button>
            </div>
          )}
        </>
      ) : (
        /* ══════════════════════════════════════
           ABA ÁLBUM
        ══════════════════════════════════════ */
        <>
          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:!text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 flex-shrink-0 w-28 sm:w-36"
            />

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

            {/* Dropdown de país */}
            <div className="relative flex-shrink-0">
              <select
                value={selectedCountry}
                onChange={e => selectCountry(e.target.value)}
                className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold border-2 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-green-400 transition-all
                  ${selectedCountry
                    ? 'border-green-600 bg-green-800 text-white'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
              >
                <option value="">🌍 País</option>
                {TEAM_COUNTRIES.map(country => (
                  <option key={country} value={country}>
                    {COUNTRY_CODES[country]} — {country}
                  </option>
                ))}
              </select>
              <span className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]
                ${selectedCountry ? 'text-green-200' : 'text-gray-400'}`}>▼</span>
            </div>

            {selectedCountry && (
              <div className="flex items-center gap-1.5 bg-green-800 text-white px-2.5 py-1.5 rounded-lg flex-shrink-0">
                {selectedFlagUrl && <img src={selectedFlagUrl} alt={selectedCountry} className="h-4 w-auto rounded-sm" />}
                <span className="text-xs font-bold">{selectedCode}</span>
                <button onClick={() => selectCountry('')} className="ml-1 text-green-300 hover:text-white text-xs font-black">✕</button>
              </div>
            )}

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

            {(['all', 'have', 'need', 'unmarked'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  filter === f
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

            {sections.map(sec => (
              <button
                key={sec}
                onClick={() => selectSection(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedSection === sec && !selectedCountry
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {selectMode && (
            <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900 px-4 py-2 flex items-center gap-3">
              <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
                {selected.size === 0
                  ? 'Clique nas figurinhas para selecioná-las'
                  : `${selected.size} figurinha${selected.size > 1 ? 's' : ''} selecionada${selected.size > 1 ? 's' : ''}`}
              </span>
              <button onClick={toggleSelectAll} className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 underline">
                {selected.size === filtered.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {selectedCountry && (
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                {selectedFlagUrl && <img src={selectedFlagUrl} alt={selectedCountry} className="h-8 w-auto rounded shadow-sm" />}
                <div>
                  <p className="font-extrabold text-gray-800 dark:text-gray-100 text-lg">{selectedCountry}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {filtered.length} figurinhas · {filtered.filter(s => haveIds.includes(s.id)).length} marcadas
                  </p>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">Nenhuma figurinha encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 gap-1.5 sm:gap-2">
                {filtered.map(sticker => (
                  <StickerCard
                    key={sticker.id}
                    sticker={sticker}
                    userSticker={userStickers[sticker.id]}
                    onPress={() => handleCardPress(sticker)}
                    selectMode={selectMode}
                    selected={selected.has(sticker.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Barra bulk — Álbum */}
          {selectMode && selected.size > 0 && (
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-1">
                {selected.size} selecionada{selected.size > 1 ? 's' : ''}
              </span>
              <button onClick={() => bulkMark('have')} disabled={bulkLoading}
                className="flex-1 bg-green-800 hover:bg-green-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                ✅ Tenho
              </button>
              <button onClick={() => bulkMark('duplicate')} disabled={bulkLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                🔁 +Repetida
              </button>
              <button onClick={() => bulkMark('need')} disabled={bulkLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                ❌ Falta
              </button>
              <button onClick={bulkRemove} disabled={bulkLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600">
                🗑
              </button>
            </div>
          )}
        </>
      )}

      <StickerActionModal
        visible={!!modalSticker}
        sticker={modalSticker}
        userSticker={modalSticker ? userStickers[modalSticker.id] : undefined}
        onClose={() => setModalSticker(null)}
        onMark={async status => {
          if (modalSticker) await markSticker(modalSticker.id, status);
          setModalSticker(null);
        }}
        onDecrementDuplicate={async () => {
          if (modalSticker) await decrementDuplicate(modalSticker.id);
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
