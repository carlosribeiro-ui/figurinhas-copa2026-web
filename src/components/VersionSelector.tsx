'use client';

import { useVersion } from '@/context/VersionContext';

export default function VersionSelector() {
  const { setVersion } = useVersion();

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <span className="text-6xl">⚽</span>
        <h1 className="text-3xl font-extrabold text-white mt-4">Figurinhas Copa 2026</h1>
        <p className="text-green-300 mt-2">Como você vai usar o app?</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => setVersion('mobile')}
          className="w-full bg-white rounded-2xl p-6 text-left shadow-xl hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="text-4xl mb-3">📱</div>
          <h2 className="text-xl font-extrabold text-green-800">Versão Mobile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Otimizada para celular — navegação por baixo, cards compactos, experiência touch.
          </p>
        </button>

        <button
          onClick={() => setVersion('web')}
          className="w-full bg-green-700 border-2 border-green-500 rounded-2xl p-6 text-left shadow-xl hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="text-4xl mb-3">💻</div>
          <h2 className="text-xl font-extrabold text-white">Versão Web</h2>
          <p className="text-sm text-green-300 mt-1">
            Layout com menu lateral, ideal para desktop e tablets.
          </p>
        </button>
      </div>

      <p className="text-green-400 text-xs mt-8">Você pode mudar isso depois no Perfil</p>
    </div>
  );
}
