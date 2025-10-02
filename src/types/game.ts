export type Currency = 'KRW' | 'USD' | 'JPY';

export type EventType = 'dollar_surge' | 'yen_weak' | 'won_strong' | 'normal';

export interface Coin {
  id: string;
  currency: Currency;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  isMerging?: boolean;
}

export interface GameEvent {
  type: EventType;
  name: string;
  description: string;
  duration: number;
  effect: string;
}

export interface GameState {
  board: (Coin | null)[][];
  score: number;
  coins: Coin[];
  currentEvent: GameEvent | null;
  eventTimeLeft: number;
  gameOver: boolean;
  exchangeTokens: number;
}

export const CURRENCY_CONFIG = {
  KRW: {
    name: '원화',
    symbol: '₩',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-400',
    darkColor: 'bg-blue-600',
    values: [100, 500, 1000, 5000, 10000, 50000],
  },
  USD: {
    name: '달러',
    symbol: '$',
    color: 'bg-green-500',
    lightColor: 'bg-green-400',
    darkColor: 'bg-green-600',
    values: [1, 5, 10, 20, 50, 100],
  },
  JPY: {
    name: '엔화',
    symbol: '¥',
    color: 'bg-red-500',
    lightColor: 'bg-red-400',
    darkColor: 'bg-red-600',
    values: [100, 500, 1000, 5000, 10000, 50000],
  },
} as const;

export const GAME_EVENTS: GameEvent[] = [
  {
    type: 'dollar_surge',
    name: '💵 달러 강세!',
    description: '달러 코인 합칠 때 2배 보너스!',
    duration: 15,
    effect: 'usd_bonus',
  },
  {
    type: 'yen_weak',
    name: '💴 엔저 현상!',
    description: '엔화 코인이 더 자주 등장!',
    duration: 15,
    effect: 'yen_spawn',
  },
  {
    type: 'won_strong',
    name: '💰 원화 강세!',
    description: '원화 코인 합칠 때 2배 보너스!',
    duration: 15,
    effect: 'krw_bonus',
  },
];