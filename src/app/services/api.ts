import { getToken } from '../lib/auth';
import type { Bolao, Participant, User, UserSummary } from '../components/types';

// ── Raw API types (match .NET DTOs) ──────────────────────────────────────────

interface ApiUser {
  id: string; name: string; username: string;
  avatar: string | null; totalPoints: number; bestRank: number; boloesCount: number;
}
interface ApiUserSummary { id: string; name: string; username: string; avatar: string | null; }
interface ApiAuthResult { token: string; user: ApiUser; }
interface ApiTeam { id: string; name: string; flag: string; }
interface ApiBolao {
  id: string; homeTeam: ApiTeam; awayTeam: ApiTeam; matchDate: string;
  status: string; homeScore: number | null; awayScore: number | null;
  createdById: string; createdBy: string;
  organizerId: string | null; organizerName: string | null;
  valorBolao: number; pixKey: string | null;
  participantCount: number; paidCount: number;
}
interface ApiParticipant {
  userId: string; name: string; avatar: string | null;
  palpite: { placarHome: number; placarAway: number } | null;
  pontos: number; rank: number; pagou: boolean;
}
interface ApiBolaoDetail extends Omit<ApiBolao, 'participantCount'> {
  participants: ApiParticipant[];
}
interface ApiRankingEntry {
  rank: number; userId: string; name: string;
  avatar: string | null; totalPoints: number; boloesCount: number;
}

// ── HTTP client ───────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 204) return null as T;
  const body = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
  if (!res.ok) throw new Error(body.error || `Erro ${res.status}`);
  return body as T;
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function fmtStatus(s: string): Bolao['status'] {
  if (s === 'EmAndamento') return 'Em Andamento';
  return s as Bolao['status'];
}
function avatarFallback(avatar: string | null, id: string): string {
  return avatar || `https://i.pravatar.cc/150?u=${id}`;
}

function mapUser(u: ApiUser): User {
  return {
    id: u.id, name: u.name, username: u.username,
    avatar: avatarFallback(u.avatar, u.id),
    points: u.totalPoints, bestRank: u.bestRank, boloesCount: u.boloesCount,
  };
}

function mapBolao(b: ApiBolao): Bolao {
  return {
    id: b.id,
    homeTeam: { name: b.homeTeam.name, shortName: b.homeTeam.id.slice(0, 3).toUpperCase(), flag: b.homeTeam.flag },
    awayTeam: { name: b.awayTeam.name, shortName: b.awayTeam.id.slice(0, 3).toUpperCase(), flag: b.awayTeam.flag },
    date: fmtDate(b.matchDate), time: fmtTime(b.matchDate),
    matchDateIso: b.matchDate,
    participants: b.participantCount,
    paidCount: b.paidCount ?? 0,
    organizer: b.organizerName ?? b.createdBy,
    organizerId: b.organizerId ?? undefined,
    createdById: b.createdById,
    valorBolao: b.valorBolao ?? 0,
    pixKey: b.pixKey ?? undefined,
    status: fmtStatus(b.status),
    homeScore: b.homeScore ?? undefined,
    awayScore: b.awayScore ?? undefined,
  };
}

function mapParticipant(p: ApiParticipant): Participant {
  return {
    id: p.userId, name: p.name,
    avatar: avatarFallback(p.avatar, p.userId),
    points: p.pontos,
    pagou: p.pagou,
    prediction: p.palpite ? { home: p.palpite.placarHome, away: p.palpite.placarAway } : undefined,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const r = await request<ApiAuthResult>('/auth/login', {
        method: 'POST', body: JSON.stringify({ username, password }),
      });
      return { user: mapUser(r.user), token: r.token };
    },
    register: async (name: string, username: string, password: string) => {
      const r = await request<ApiAuthResult>('/auth/register', {
        method: 'POST', body: JSON.stringify({ name, username, password }),
      });
      return { user: mapUser(r.user), token: r.token };
    },
  },

  boloes: {
    getAll: async (status?: string): Promise<Bolao[]> => {
      const qs = status ? `?status=${status}` : '';
      const r = await request<ApiBolao[]>(`/boloes${qs}`);
      return r.map(mapBolao);
    },
    getDetail: async (id: string): Promise<{ bolao: Bolao; participants: Participant[] }> => {
      const r = await request<ApiBolaoDetail>(`/boloes/${id}`);
      const bolao: Bolao = {
        id: r.id,
        homeTeam: { name: r.homeTeam.name, shortName: r.homeTeam.id.slice(0, 3).toUpperCase(), flag: r.homeTeam.flag },
        awayTeam: { name: r.awayTeam.name, shortName: r.awayTeam.id.slice(0, 3).toUpperCase(), flag: r.awayTeam.flag },
        date: fmtDate(r.matchDate), time: fmtTime(r.matchDate),
        matchDateIso: r.matchDate,
        participants: r.participants.length,
        paidCount: r.paidCount ?? 0,
        organizer: r.organizerName ?? r.createdBy,
        organizerId: r.organizerId ?? undefined,
        createdById: r.createdById,
        valorBolao: r.valorBolao ?? 0,
        pixKey: r.pixKey ?? undefined,
        status: fmtStatus(r.status),
        homeScore: r.homeScore ?? undefined,
        awayScore: r.awayScore ?? undefined,
      };
      return { bolao, participants: r.participants.map(mapParticipant) };
    },
    create: (dto: {
      homeTeamId: string; homeTeamName: string; homeTeamFlag: string;
      awayTeamId: string; awayTeamName: string; awayTeamFlag: string;
      matchDate: string; organizerId?: string | null; valorBolao: number; pixKey?: string | null;
    }) => request<ApiBolao>('/boloes', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: {
      homeTeamId: string; homeTeamName: string; homeTeamFlag: string;
      awayTeamId: string; awayTeamName: string; awayTeamFlag: string;
      matchDate: string; organizerId?: string | null; valorBolao: number; pixKey?: string | null;
    }) => request<ApiBolao>(`/boloes/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    join: (id: string) => request<null>(`/boloes/${id}/join`, { method: 'POST' }),
    submitPalpite: (bolaoId: string, placarHome: number, placarAway: number) =>
      request(`/boloes/${bolaoId}/palpites`, {
        method: 'POST', body: JSON.stringify({ placarHome, placarAway }),
      }),
    updatePalpite: (bolaoId: string, placarHome: number, placarAway: number) =>
      request(`/boloes/${bolaoId}/palpites`, {
        method: 'PUT', body: JSON.stringify({ placarHome, placarAway }),
      }),
    updatePagamento: (bolaoId: string, userId: string, pagou: boolean) =>
      request<null>(`/boloes/${bolaoId}/participantes/${userId}/pagamento`, {
        method: 'PATCH', body: JSON.stringify({ pagou }),
      }),
    setResultado: (bolaoId: string, homeScore: number, awayScore: number) =>
      request<null>(`/boloes/${bolaoId}/resultado`, {
        method: 'PUT', body: JSON.stringify({ homeScore, awayScore }),
      }),
  },

  ranking: {
    getGlobal: async (): Promise<Participant[]> => {
      const r = await request<ApiRankingEntry[]>('/ranking');
      return r.map(e => ({
        id: e.userId, name: e.name,
        avatar: avatarFallback(e.avatar, e.userId),
        points: e.totalPoints,
        pagou: false,
      }));
    },
    getBolao: async (bolaoId: string): Promise<Participant[]> => {
      const r = await request<ApiParticipant[]>(`/boloes/${bolaoId}/ranking`);
      return r.map(mapParticipant);
    },
  },

  profile: {
    get: async (): Promise<User> => mapUser(await request<ApiUser>('/profile')),
    update: async (data: { name?: string; avatar?: string }): Promise<User> =>
      mapUser(await request<ApiUser>('/profile', { method: 'PUT', body: JSON.stringify(data) })),
    uploadAvatar: async (file: File): Promise<User> => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const body = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
      if (!res.ok) throw new Error(body.error || `Erro ${res.status}`);
      return mapUser(body as ApiUser);
    },
  },

  users: {
    getAll: async (): Promise<UserSummary[]> => {
      const r = await request<ApiUserSummary[]>('/users');
      return r.map(u => ({
        id: u.id, name: u.name, username: u.username,
        avatar: avatarFallback(u.avatar, u.id),
      }));
    },
  },
};
