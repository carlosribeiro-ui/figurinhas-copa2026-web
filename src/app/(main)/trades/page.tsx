'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { TradeProposal } from '@/types';
import { getStickerById } from '@/constants/stickers';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Aguardando', accepted: 'Aceita ✅', rejected: 'Recusada ❌', cancelled: 'Cancelada',
};

export default function TradesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [toast, setToast] = useState('');

  useEffect(() => { if (user) fetchTrades(); }, [user, tab]);

  async function fetchTrades() {
    setLoading(true);
    const column = tab === 'received' ? 'receiver_id' : 'sender_id';
    const { data } = await supabase
      .from('trade_proposals')
      .select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)')
      .eq(column, user!.id)
      .order('created_at', { ascending: false });
    setTrades(data ?? []);
    setLoading(false);
  }

  async function respond(tradeId: string, status: 'accepted' | 'rejected') {
    await supabase.from('trade_proposals').update({ status }).eq('id', tradeId);
    fetchTrades();
    setToast(status === 'accepted' ? 'Troca aceita! 🎉' : 'Proposta recusada.');
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-800 text-white px-5 py-3 rounded-xl shadow-xl font-semibold text-sm animate-bounce">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Propostas de Troca</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('received')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'received' ? 'bg-white text-green-800 shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Recebidas
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'sent' ? 'bg-white text-green-800 shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Enviadas
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-4xl animate-spin">⚽</div>
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-4xl mb-3">🔄</p>
          <p className="font-semibold">
            {tab === 'received' ? 'Nenhuma proposta recebida' : 'Nenhuma proposta enviada'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map(trade => {
            const other = tab === 'received' ? trade.sender : trade.receiver;
            return (
              <div key={trade.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {(other?.full_name || other?.username || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{other?.full_name ?? other?.username}</p>
                    <p className="text-xs text-gray-400">{new Date(trade.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[trade.status]}`}>
                    {STATUS_LABEL[trade.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-500 mb-2">
                      {tab === 'received' ? 'Oferece:' : 'Você oferece:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(trade.sender_offers ?? []).slice(0, 8).map(id => (
                        <span key={id} className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                          {getStickerById(id)?.number ?? `#${id}`}
                        </span>
                      ))}
                      {(trade.sender_offers ?? []).length > 8 && (
                        <span className="text-xs text-gray-400">+{(trade.sender_offers ?? []).length - 8}</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-500 mb-2">
                      {tab === 'received' ? 'Pede em troca:' : 'Você quer:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(trade.receiver_wants ?? []).slice(0, 8).map(id => (
                        <span key={id} className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {getStickerById(id)?.number ?? `#${id}`}
                        </span>
                      ))}
                      {(trade.receiver_wants ?? []).length > 8 && (
                        <span className="text-xs text-gray-400">+{(trade.receiver_wants ?? []).length - 8}</span>
                      )}
                    </div>
                  </div>
                </div>

                {tab === 'received' && trade.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => respond(trade.id, 'accepted')}
                      className="flex-1 bg-green-800 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Aceitar troca
                    </button>
                    <button
                      onClick={() => respond(trade.id, 'rejected')}
                      className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Recusar
                    </button>
                  </div>
                )}
                {trade.status === 'accepted' && (
                  <button
                    onClick={() => router.push(`/chat?trade=${trade.id}`)}
                    className="w-full bg-green-800 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    💬 Abrir chat com {other?.full_name ?? other?.username}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
