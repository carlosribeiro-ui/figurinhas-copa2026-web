'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/hooks/useStickers';
import StickerCard from '@/components/StickerCard';
import StickerActionModal from '@/components/StickerActionModal';
import ProgressBar from '@/components/ProgressBar';
import { COPA_2026_STICKERS, SECTIONS, COUNTRIES, TOTAL_STICKERS, COUNTRY_CODES, getFlagUrl } from '@/constants/stickers';
import { Sticker } from '@/types';

type FilterType = 'all' | 'have' | 'need' | 'duplicate' | 'unmarked';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todas', have: 'Tenho', need: 'Faltam', duplicate: 'Repetidas', unmarked: 'Sem marca',
};

// Países jogáveis (sem FWC especiais)
const TEAM_COUNTRIES = COUNTRIES.filter(c => !['ABERTURA', 'SEDES', 'LENDAS'].includes(c));

export default function AlbumPage() {
  const { user } = useAuth();
  const { userStickers, haveIds, needIds, duplicateIds, markSticker, removeSticker } = useStickers(user?.id);
  const [selectedSection, setSelectedSection] = useState('Todos');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [modalSticker, setModalSticker] = useState<Sticker | null>(null);

  // multi-select
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const sections = ['Todos', ...SECTIONS];

  const filtered = useMemo(() => {
    let stickers = COPA_2026_STICKERS;
    if (selectedCountry)          stickers = stickers.filter(s => s.country === selectedCountry);
    else if (selectedSection !== 'Todos') stickers = stickers.filter(s => s.section === selectedSection);
    if (search) stickers = stickers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.number.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === 'have')      stickers = stickers.filter(s => haveIds.includes(s.id));
    if (filter === 'need')      stickers = stickers.filter(s => needIds.includes(s.id));
    if (filter === 'duplicate') stickers = stickers.filter(s => duplicateIds.includes(s.id));
    if (filter === 'unmarked')  stickers = stickers.filter(s => !userStickers[s.id]);
    return stickers;
  }, [selectedSection, selectedCountry, filter, search, userStickers, haveIds, needIds, duplicateIds]);

  function selectCountry(country: string) {
    setSelectedCountry(country);
    if (country) setSelectedSection('Todos'); // limpa seção ao escolher país
  }

  function selectSection(sec: string) {
    setSelectedSection(sec);
    setSelectedCountry(''); // limpa país ao escolher seção
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(s => s.id)));
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  async function bulkMark(status: 'have' | 'need' | 'duplicate') {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all([...selected].map(id => markSticker(id, status)));
    setBulkLoading(false);
    exitSelectMode();
  }

  async function bulkRemove() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all([...selected].map(id => removeSticker(id)));
    setBulkLoading(false);
    exitSelectMode();
  }

  function handleCardPress(sticker: Sticker) {
    if (selectMode) toggleSelect(sticker.id);
    else setModalSticker(sticker);
  }

  // Info do país selecionado para o header do dropdown
  const selectedFlagUrl = selectedCountry ? getFlagUrl(selectedCountry) : null;
  const selectedCode    = selectedCountry ? (COUNTRY_CODES[selectedCountry] ?? '') : '';

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ── Stats bar ── */}
      <div className="bg-green-800 text-white px-4 py-3">
        {/* Stats: compacto no mobile, expandido no desktop */}
        <div className="flex items-center gap-3 sm:gap-6 mb-3 flex-wrap">
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold">{haveIds.length}</p>
            <p className="text-[10px] sm:text-xs text-green-300">Tenho</p>
          </div>
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold text-amber-300">{duplicateIds.length}</p>
            <p className="text-[10px] sm:text-xs text-green-300">Repetidas</p>
          </div>
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold text-red-300">{needIds.length}</p>
            <p className="text-[10px] sm:text-xs text-green-300">Faltam</p>
          </div>
          <div className="text-center min-w-[44px]">
            <p className="text-lg sm:text-2xl font-extrabold text-gray-300">
              {TOTAL_STICKERS - haveIds.length - needIds.length}
            </p>
            <p className="text-[10px] sm:text-xs text-green-300">Não marc.</p>
          </div>
          <div className="flex-1 min-w-[80px]">
            <ProgressBar
              current={haveIds.length}
              total={TOTAL_STICKERS}
              label={`${haveIds.length} / ${TOTAL_STICKERS}`}
              color="#4ade80"
            />
          </div>

          {/* Botão selecionar */}
          <button
            onClick={() => { setSelectMode(v => !v); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
              selectMode ? 'bg-white text-green-800' : 'bg-green-700 text-white hover:bg-green-600'
            }`}
          >
            {selectMode ? '✕ Cancelar' : '☑ Selecionar'}
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar figurinha..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-lg bg-green-700 text-white placeholder-green-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">

        {/* Dropdown de país */}
        <div className="relative flex-shrink-0">
          <select
            value={selectedCountry}
            onChange={e => selectCountry(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold border-2 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-green-400 transition-all
              ${selectedCountry
                ? 'border-green-600 bg-green-800 text-white'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <option value="">🌍 Todos os países</option>
            {TEAM_COUNTRIES.map(country => (
              <option key={country} value={country}>
                {COUNTRY_CODES[country]} — {country}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <span className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]
            ${selectedCountry ? 'text-green-200' : 'text-gray-400'}`}>▼</span>
        </div>

        {/* Badge do país selecionado */}
        {selectedCountry && (
          <div className="flex items-center gap-1.5 bg-green-800 text-white px-2.5 py-1.5 rounded-lg flex-shrink-0">
            {selectedFlagUrl && (
              <img src={selectedFlagUrl} alt={selectedCountry} className="h-4 w-auto rounded-sm" />
            )}
            <span className="text-xs font-bold">{selectedCode}</span>
            <button
              onClick={() => selectCountry('')}
              className="ml-1 text-green-300 hover:text-white text-xs font-black"
            >✕</button>
          </div>
        )}

        <div className="w-px h-5 bg-gray-200 flex-shrink-0 mx-1" />

        {/* Filtros de status */}
        <div className="flex gap-1.5 items-center flex-shrink-0">
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

        <div className="w-px h-5 bg-gray-200 flex-shrink-0 mx-1" />

        {/* Seções (grupos) */}
        {sections.map(sec => (
          <button
            key={sec}
            onClick={() => selectSection(sec)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              selectedSection === sec && !selectedCountry
                ? 'bg-green-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* ── Modo seleção info ── */}
      {selectMode && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-3">
          <span className="text-blue-700 text-sm font-semibold">
            {selected.size === 0
              ? 'Clique nas figurinhas para selecioná-las'
              : `${selected.size} figurinha${selected.size > 1 ? 's' : ''} selecionada${selected.size > 1 ? 's' : ''}`}
          </span>
          <button
            onClick={toggleSelectAll}
            className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 underline"
          >
            {selected.size === filtered.length ? 'Desmarcar todas' : 'Selecionar todas'}
          </button>
        </div>
      )}

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Cabeçalho do país selecionado */}
        {selectedCountry && (
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
            {selectedFlagUrl && (
              <img src={selectedFlagUrl} alt={selectedCountry} className="h-8 w-auto rounded shadow-sm" />
            )}
            <div>
              <p className="font-extrabold text-gray-800 text-lg">{selectedCountry}</p>
              <p className="text-xs text-gray-400">
                {filtered.length} figurinhas ·{' '}
                {filtered.filter(s => haveIds.includes(s.id)).length} marcadas
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

      {/* ── Barra de ação em massa ── */}
      {selectMode && selected.size > 0 && (
        <div className="bg-white border-t border-gray-200 shadow-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700 mr-1">
            {selected.size} selecionada{selected.size > 1 ? 's' : ''}
          </span>
          <button onClick={() => bulkMark('have')} disabled={bulkLoading}
            className="flex-1 bg-green-800 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
            ✅ Tenho
          </button>
          <button onClick={() => bulkMark('duplicate')} disabled={bulkLoading}
            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-200 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
            🔁 Repetida
          </button>
          <button onClick={() => bulkMark('need')} disabled={bulkLoading}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-200 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
            ❌ Falta
          </button>
          <button onClick={bulkRemove} disabled={bulkLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all border border-gray-200">
            🗑
          </button>
        </div>
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
        onRemove={async () => {
          if (modalSticker) await removeSticker(modalSticker.id);
          setModalSticker(null);
        }}
      />
    </div>
  );
}
