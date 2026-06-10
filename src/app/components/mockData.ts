import type { Bolao, Participant, User } from './types';

export const currentUser: User = {
  id: '1',
  name: 'César',
  username: 'cesar',
  avatar: 'https://i.pravatar.cc/150?img=7',
  points: 147,
  bestRank: 2,
  boloesCount: 8,
};

export const boloes: Bolao[] = [
  {
    id: '1',
    homeTeam: { name: 'Brasil', shortName: 'BRA', flag: '🇧🇷' },
    awayTeam: { name: 'Argentina', shortName: 'ARG', flag: '🇦🇷' },
    date: '15 Jun 2026', time: '16:00', matchDateIso: '2026-06-15T16:00:00Z',
    participants: 12, organizer: 'César', valorBolao: 0, status: 'Aberto',
  },
  {
    id: '2',
    homeTeam: { name: 'França', shortName: 'FRA', flag: '🇫🇷' },
    awayTeam: { name: 'Espanha', shortName: 'ESP', flag: '🇪🇸' },
    date: '16 Jun 2026', time: '18:00', matchDateIso: '2026-06-16T18:00:00Z',
    participants: 8, organizer: 'João', valorBolao: 50, status: 'Aberto',
  },
  {
    id: '3',
    homeTeam: { name: 'Alemanha', shortName: 'GER', flag: '🇩🇪' },
    awayTeam: { name: 'Inglaterra', shortName: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    date: '12 Jun 2026', time: '12:00', matchDateIso: '2026-06-12T12:00:00Z',
    participants: 15, organizer: 'Pedro', valorBolao: 100, status: 'Encerrado',
    homeScore: 2, awayScore: 1,
  },
  {
    id: '4',
    homeTeam: { name: 'Portugal', shortName: 'POR', flag: '🇵🇹' },
    awayTeam: { name: 'Uruguai', shortName: 'URU', flag: '🇺🇾' },
    date: '17 Jun 2026', time: '20:00', matchDateIso: '2026-06-17T20:00:00Z',
    participants: 6, organizer: 'Lucas', valorBolao: 0, status: 'Aberto',
  },
  {
    id: '5',
    homeTeam: { name: 'Itália', shortName: 'ITA', flag: '🇮🇹' },
    awayTeam: { name: 'Holanda', shortName: 'NED', flag: '🇳🇱' },
    date: '13 Jun 2026', time: '15:00', matchDateIso: '2026-06-13T15:00:00Z',
    participants: 10, organizer: 'Ana', valorBolao: 30, status: 'Em Andamento',
    homeScore: 1, awayScore: 1,
  },
];

export const participants: Participant[] = [
  { id: '1', name: 'César', avatar: 'https://i.pravatar.cc/150?img=7', points: 147, prediction: { home: 2, away: 1 } },
  { id: '2', name: 'João', avatar: 'https://i.pravatar.cc/150?img=12', points: 132, prediction: { home: 1, away: 0 } },
  { id: '3', name: 'Pedro', avatar: 'https://i.pravatar.cc/150?img=15', points: 128, prediction: { home: 3, away: 2 } },
  { id: '4', name: 'Ana', avatar: 'https://i.pravatar.cc/150?img=5', points: 115, prediction: { home: 1, away: 1 } },
  { id: '5', name: 'Lucas', avatar: 'https://i.pravatar.cc/150?img=3', points: 98, prediction: { home: 2, away: 0 } },
  { id: '6', name: 'Mariana', avatar: 'https://i.pravatar.cc/150?img=9', points: 87, prediction: { home: 0, away: 1 } },
  { id: '7', name: 'Rafael', avatar: 'https://i.pravatar.cc/150?img=11', points: 76, prediction: { home: 1, away: 2 } },
  { id: '8', name: 'Fernanda', avatar: 'https://i.pravatar.cc/150?img=16', points: 65, prediction: { home: 2, away: 2 } },
  { id: '9', name: 'Bruno', avatar: 'https://i.pravatar.cc/150?img=4', points: 54, prediction: { home: 0, away: 0 } },
  { id: '10', name: 'Carla', avatar: 'https://i.pravatar.cc/150?img=6', points: 43, prediction: { home: 1, away: 3 } },
];
