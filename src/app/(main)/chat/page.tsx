'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Profile, Message } from '@/types';

interface Conversation {
  trade_id: string;
  other_user: Profile;
  last_message: string;
  last_at: string;
}

function ChatInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  useEffect(() => {
    if (!activeTradeId) return;
    fetchMessages(activeTradeId);
    const sub = supabase
      .channel(`chat:${activeTradeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `trade_id=eq.${activeTradeId}` },
        payload => {
          setMessages(prev => [...prev, payload.new as Message]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [activeTradeId]);

  async function fetchConversations() {
    setLoading(true);
    const { data: trades } = await supabase
      .from('trade_proposals')
      .select('id, sender_id, receiver_id, sender:profiles!sender_id(id,username,full_name,city,avatar_url,role), receiver:profiles!receiver_id(id,username,full_name,city,avatar_url,role)')
      .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
      .eq('status', 'accepted');

    if (!trades) { setLoading(false); return; }

    const convs: Conversation[] = await Promise.all(
      trades.map(async trade => {
        const other = trade.sender_id === user!.id ? trade.receiver as unknown as Profile : trade.sender as unknown as Profile;
        const { data: msgs } = await supabase
          .from('messages').select('content, created_at').eq('trade_id', trade.id)
          .order('created_at', { ascending: false }).limit(1);
        return {
          trade_id: trade.id,
          other_user: other as Profile,
          last_message: msgs?.[0]?.content ?? 'Nenhuma mensagem ainda',
          last_at: msgs?.[0]?.created_at ?? '',
        };
      })
    );
    setConversations(convs);
    setLoading(false);

    const tradeParam = searchParams.get('trade');
    if (tradeParam && convs.some(c => c.trade_id === tradeParam)) {
      setActiveTradeId(tradeParam);
    }
  }

  async function fetchMessages(tradeId: string) {
    const { data } = await supabase
      .from('messages').select('*, sender:profiles!sender_id(*)')
      .eq('trade_id', tradeId).order('created_at', { ascending: true });
    setMessages(data ?? []);
    setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeTradeId) return;
    const content = text.trim();
    setText('');
    await supabase.from('messages').insert({ trade_id: activeTradeId, sender_id: user!.id, content });
  }

  const activeConv = conversations.find(c => c.trade_id === activeTradeId);

  if (activeTradeId) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-green-800 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setActiveTradeId(null)} className="text-green-300 hover:text-white text-xl font-bold flex-shrink-0">←</button>
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-base">
              {(activeConv?.other_user.full_name || activeConv?.other_user.username || '?')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white leading-tight truncate">
              {activeConv?.other_user.full_name || activeConv?.other_user.username || 'Usuário'}
            </p>
            <p className="text-green-300 text-xs truncate">
              @{activeConv?.other_user.username ?? '—'}
              {activeConv?.other_user.city ? ` · ${activeConv.other_user.city}` : ''}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900">
          {messages.map(msg => {
            const isMe = msg.sender_id === user!.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-4 py-2.5 shadow-sm ${isMe ? 'bg-green-800 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm'}`}>
                  <p className="text-sm select-text cursor-text">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-green-300' : 'text-gray-400'} text-right`}>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-3 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Mensagem..."
            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-green-800 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            ➤
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Mensagens</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Conversas de trocas aceitas</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="text-4xl animate-spin">⚽</div></div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-5xl mb-4">💬</p>
          <p className="font-bold text-gray-600 dark:text-gray-400 text-lg">Nenhuma conversa ainda</p>
          <p className="text-sm mt-2">Quando uma troca for aceita, o chat será aberto.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <button
              key={conv.trade_id}
              onClick={() => setActiveTradeId(conv.trade_id)}
              className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:border-green-200 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-lg">
                  {(conv.other_user.full_name || conv.other_user.username || '?')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 dark:text-gray-100">{conv.other_user.full_name ?? conv.other_user.username}</p>
                <p className="text-sm text-gray-400 truncate">{conv.last_message}</p>
              </div>
              {conv.last_at && (
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(conv.last_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="text-4xl animate-spin">⚽</div></div>}>
      <ChatInner />
    </Suspense>
  );
}
