export type Screen =
  | 'login'
  | 'register'
  | 'home'
  | 'boloes'
  | 'classificacao'
  | 'bolao-detail'
  | 'palpite'
  | 'bolao-ranking'
  | 'palpites-list'
  | 'profile'
  | 'criar-bolao'
  | 'editar-bolao';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  points: number;
  bestRank: number;
  boloesCount: number;
}

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface Team {
  name: string;
  shortName: string;
  flag: string;
}

export interface Bolao {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  matchDateIso: string;
  participants: number;
  organizer: string;
  organizerId?: string;
  valorBolao: number;
  pixKey?: string;
  status: 'Aberto' | 'Encerrado' | 'Em Andamento';
  homeScore?: number;
  awayScore?: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  points: number;
  prediction?: { home: number; away: number };
}
