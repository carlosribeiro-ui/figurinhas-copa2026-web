export interface Profile {
  id: string;
  username: string;
  email?: string | null;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  role?: 'admin' | 'user' | null;
  created_at: string;
}

export interface Sticker {
  id: number;
  number: string;
  code: string;
  name: string;
  country: string;
  section: string;
  type: 'player' | 'team' | 'special' | 'stadium' | 'legend';
  is_shiny: boolean;
}

export interface UserSticker {
  user_id: string;
  sticker_id: number;
  quantity: number;
  status: 'have' | 'need' | 'duplicate';
}

export interface TradeProposal {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_offers: number[];
  receiver_wants: number[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Message {
  id: string;
  trade_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}
