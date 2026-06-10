import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Search, X, Calendar, Clock, DollarSign, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { Bolao, Screen, UserSummary } from './types';

interface CriarBolaoProps {
  onBack: () => void;
  onNavigate: (screen: Screen, data?: unknown) => void;
  editando?: Bolao;
}

interface TeamOption {
  id: string;
  name: string;
  flag: string;
  category: 'seleção' | 'clube';
}

const TEAMS: TeamOption[] = [
  // Seleções
  { id: 'brasil',        name: 'Brasil',         flag: '🇧🇷', category: 'seleção' },
  { id: 'argentina',     name: 'Argentina',      flag: '🇦🇷', category: 'seleção' },
  { id: 'franca',        name: 'França',         flag: '🇫🇷', category: 'seleção' },
  { id: 'alemanha',      name: 'Alemanha',       flag: '🇩🇪', category: 'seleção' },
  { id: 'espanha',       name: 'Espanha',        flag: '🇪🇸', category: 'seleção' },
  { id: 'portugal',      name: 'Portugal',       flag: '🇵🇹', category: 'seleção' },
  { id: 'italia',        name: 'Itália',         flag: '🇮🇹', category: 'seleção' },
  { id: 'inglaterra',    name: 'Inglaterra',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', category: 'seleção' },
  { id: 'holanda',       name: 'Holanda',        flag: '🇳🇱', category: 'seleção' },
  { id: 'uruguai',       name: 'Uruguai',        flag: '🇺🇾', category: 'seleção' },
  { id: 'colombia',      name: 'Colômbia',       flag: '🇨🇴', category: 'seleção' },
  { id: 'mexico',        name: 'México',         flag: '🇲🇽', category: 'seleção' },
  { id: 'eua',           name: 'EUA',            flag: '🇺🇸', category: 'seleção' },
  { id: 'japao',         name: 'Japão',          flag: '🇯🇵', category: 'seleção' },
  { id: 'coreia-sul',    name: 'Coreia do Sul',  flag: '🇰🇷', category: 'seleção' },
  { id: 'marrocos',      name: 'Marrocos',       flag: '🇲🇦', category: 'seleção' },
  { id: 'senegal',       name: 'Senegal',        flag: '🇸🇳', category: 'seleção' },
  { id: 'nigeria',       name: 'Nigéria',        flag: '🇳🇬', category: 'seleção' },
  { id: 'croacia',       name: 'Croácia',        flag: '🇭🇷', category: 'seleção' },
  { id: 'belgica',       name: 'Bélgica',        flag: '🇧🇪', category: 'seleção' },
  { id: 'suica',         name: 'Suíça',          flag: '🇨🇭', category: 'seleção' },
  { id: 'dinamarca',     name: 'Dinamarca',      flag: '🇩🇰', category: 'seleção' },
  { id: 'polonia',       name: 'Polônia',        flag: '🇵🇱', category: 'seleção' },
  { id: 'austria',       name: 'Áustria',        flag: '🇦🇹', category: 'seleção' },
  { id: 'chile',         name: 'Chile',          flag: '🇨🇱', category: 'seleção' },
  { id: 'peru',          name: 'Peru',           flag: '🇵🇪', category: 'seleção' },
  { id: 'paraguai',      name: 'Paraguai',       flag: '🇵🇾', category: 'seleção' },
  { id: 'bolivia',       name: 'Bolívia',        flag: '🇧🇴', category: 'seleção' },
  { id: 'venezuela',     name: 'Venezuela',      flag: '🇻🇪', category: 'seleção' },
  { id: 'equador',       name: 'Equador',        flag: '🇪🇨', category: 'seleção' },
  // Clubes brasileiros
  { id: 'flamengo',      name: 'Flamengo',       flag: '🦅', category: 'clube' },
  { id: 'palmeiras',     name: 'Palmeiras',      flag: '🐷', category: 'clube' },
  { id: 'corinthians',   name: 'Corinthians',    flag: '⚽', category: 'clube' },
  { id: 'sao-paulo',     name: 'São Paulo',      flag: '🔴', category: 'clube' },
  { id: 'atletico-mg',   name: 'Atlético-MG',    flag: '🐓', category: 'clube' },
  { id: 'gremio',        name: 'Grêmio',         flag: '🔵', category: 'clube' },
  { id: 'internacional', name: 'Internacional',  flag: '❤️', category: 'clube' },
  { id: 'fluminense',    name: 'Fluminense',     flag: '🌹', category: 'clube' },
  { id: 'botafogo',      name: 'Botafogo',       flag: '⭐', category: 'clube' },
  { id: 'vasco',         name: 'Vasco da Gama',  flag: '⚔️', category: 'clube' },
  { id: 'santos',        name: 'Santos',         flag: '🐟', category: 'clube' },
  { id: 'cruzeiro',      name: 'Cruzeiro',       flag: '🦊', category: 'clube' },
  { id: 'athletico-pr',  name: 'Athletico-PR',   flag: '🌪️', category: 'clube' },
  { id: 'fortaleza',     name: 'Fortaleza',      flag: '🦁', category: 'clube' },
  { id: 'bahia',         name: 'Bahia',          flag: '🔵', category: 'clube' },
];

type PickerType = 'home' | 'away' | 'organizer';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function nowTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
function isoToDateStr(iso: string): string {
  return iso.split('T')[0];
}
function isoToTimeStr(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function teamFromBolao(bolao: Bolao, side: 'home' | 'away'): TeamOption | null {
  const t = side === 'home' ? bolao.homeTeam : bolao.awayTeam;
  const found = TEAMS.find(opt => opt.name === t.name);
  return found ?? { id: t.name.toLowerCase(), name: t.name, flag: t.flag, category: 'seleção' };
}

export function CriarBolao({ onBack, onNavigate, editando }: CriarBolaoProps) {
  const isEdit = !!editando;

  // Team state
  const [homeTeam, setHomeTeam] = useState<TeamOption | null>(
    editando ? teamFromBolao(editando, 'home') : null
  );
  const [awayTeam, setAwayTeam] = useState<TeamOption | null>(
    editando ? teamFromBolao(editando, 'away') : null
  );

  // Date / time — parse from bolão if editing
  const [date, setDate] = useState(() => {
    if (!editando) return todayStr();
    // Try to reconstruct from formatted date; fall back to today
    return todayStr();
  });
  const [time, setTime] = useState(() => {
    if (!editando) return nowTimeStr();
    return nowTimeStr();
  });

  // Valor e Pix
  const [valor, setValor] = useState<string>(
    editando ? String(editando.valorBolao) : ''
  );
  const [pix, setPix] = useState(editando?.pixKey ?? '');

  // Organizer
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [organizer, setOrganizer] = useState<UserSummary | null>(null);

  // Picker sheet state
  const [picker, setPicker] = useState<PickerType | null>(null);
  const [search, setSearch] = useState('');

  // Form state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load users once
  useEffect(() => {
    api.users.getAll()
      .then(list => {
        setUsers(list);
        if (editando?.organizerId) {
          const org = list.find(u => u.id === editando.organizerId);
          if (org) setOrganizer(org);
        }
      })
      .catch(console.error);
  }, [editando?.organizerId]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? TEAMS.filter(t => t.name.toLowerCase().includes(q)) : TEAMS;
  }, [search]);

  const groupedTeams = useMemo(() => ({
    selecoes: filteredTeams.filter(t => t.category === 'seleção'),
    clubes:   filteredTeams.filter(t => t.category === 'clube'),
  }), [filteredTeams]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? users.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
      : users;
  }, [search, users]);

  const isReady = homeTeam && awayTeam && date && time && homeTeam.id !== awayTeam.id;

  const handleSubmit = async () => {
    if (!isReady) return;
    setLoading(true);
    setError('');
    try {
      const matchDate = new Date(`${date}T${time}:00`).toISOString();
      const dto = {
        homeTeamId:   homeTeam.id,
        homeTeamName: homeTeam.name,
        homeTeamFlag: homeTeam.flag,
        awayTeamId:   awayTeam.id,
        awayTeamName: awayTeam.name,
        awayTeamFlag: awayTeam.flag,
        matchDate,
        organizerId: organizer?.id ?? null,
        valorBolao: parseFloat(valor) || 0,
        pixKey: pix.trim() || null,
      };

      if (isEdit && editando) {
        await api.boloes.update(editando.id, dto);
      } else {
        await api.boloes.create(dto);
      }

      setSuccess(true);
      setTimeout(() => onNavigate('boloes'), 2200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Erro ao ${isEdit ? 'salvar' : 'criar'} bolão.`);
    } finally {
      setLoading(false);
    }
  };

  const openPicker = (type: PickerType) => {
    setSearch('');
    setPicker(type);
  };

  const handlePickTeam = (team: TeamOption) => {
    if (picker === 'home') setHomeTeam(team);
    else setAwayTeam(team);
    setPicker(null);
    setSearch('');
  };

  const handlePickOrganizer = (user: UserSummary) => {
    setOrganizer(user);
    setPicker(null);
    setSearch('');
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <button onClick={onBack} className="flex items-center gap-2 mb-6" style={{ color: theme.colors.textSecondary }}>
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>
        <h1 className="text-2xl font-black" style={{ color: theme.colors.text }}>
          {isEdit ? 'Editar Bolão' : 'Novo Bolão'}
        </h1>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          {isEdit ? 'Atualize as informações da partida' : 'Configure a partida e crie seu bolão'}
        </p>
      </div>

      <div className="flex-1 px-5 flex flex-col gap-4">

        {/* Times */}
        <div className="rounded-2xl p-5" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.colors.textSecondary }}>
            Times
          </p>
          <div className="flex items-center gap-3">
            <TeamSlot label="Casa"     team={homeTeam} onTap={() => openPicker('home')} />
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: theme.colors.secondaryDark, color: theme.colors.primary, border: `1px solid ${theme.colors.cardBorder}` }}>
              VS
            </div>
            <TeamSlot label="Fora" team={awayTeam} onTap={() => openPicker('away')} />
          </div>
          {homeTeam && awayTeam && homeTeam.id === awayTeam.id && (
            <p className="text-xs mt-3 text-center" style={{ color: theme.colors.danger }}>
              Os times precisam ser diferentes
            </p>
          )}
        </div>

        {/* Data & Hora */}
        <div className="rounded-2xl p-5" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.colors.textSecondary }}>
            Data &amp; Hora
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs mb-1.5 block" style={{ color: theme.colors.textSecondary }}>Data</label>
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
                style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.inputBorder}` }}>
                <Calendar size={15} style={{ color: theme.colors.textSecondary, flexShrink: 0 }} />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm min-w-0"
                  style={{ color: theme.colors.text, colorScheme: 'dark' }} />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs mb-1.5 block" style={{ color: theme.colors.textSecondary }}>Hora</label>
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
                style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.inputBorder}` }}>
                <Clock size={15} style={{ color: theme.colors.textSecondary, flexShrink: 0 }} />
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm min-w-0"
                  style={{ color: theme.colors.text, colorScheme: 'dark' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Organizador & Valor */}
        <div className="rounded-2xl p-5" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.colors.textSecondary }}>
            Organizador &amp; Valor
          </p>

          {/* Organizer picker button */}
          <div className="mb-3">
            <label className="text-xs mb-1.5 block" style={{ color: theme.colors.textSecondary }}>Organizador</label>
            <button
              onClick={() => openPicker('organizer')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
              style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.inputBorder}` }}
            >
              {organizer ? (
                <>
                  <img
                    src={organizer.avatar}
                    alt={organizer.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>{organizer.name}</p>
                    <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>@{organizer.username}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setOrganizer(null); }}
                    className="flex-shrink-0"
                  >
                    <X size={14} style={{ color: theme.colors.textSecondary }} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: theme.colors.secondaryDark, border: `1px dashed ${theme.colors.border}` }}>
                    👤
                  </div>
                  <span className="text-sm" style={{ color: theme.colors.textSecondary }}>Selecionar organizador</span>
                  <span className="text-[10px] ml-auto" style={{ color: theme.colors.primary }}>opcional</span>
                </>
              )}
            </button>
          </div>

          {/* Valor */}
          <div className="mb-3">
            <label className="text-xs mb-1.5 block" style={{ color: theme.colors.textSecondary }}>Valor do bolão (R$)</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.inputBorder}` }}>
              <DollarSign size={15} style={{ color: theme.colors.textSecondary, flexShrink: 0 }} />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={valor}
                onChange={e => setValor(e.target.value)}
                placeholder="0,00"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: theme.colors.text }}
              />
            </div>
          </div>

          {/* Chave Pix */}
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: theme.colors.textSecondary }}>
              Chave Pix do organizador
            </label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.inputBorder}` }}>
              <QrCode size={15} style={{ color: theme.colors.textSecondary, flexShrink: 0 }} />
              <input
                type="text"
                value={pix}
                onChange={e => setPix(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: theme.colors.text }}
              />
              {pix && (
                <button onClick={() => setPix('')} className="flex-shrink-0">
                  <X size={13} style={{ color: theme.colors.textSecondary }} />
                </button>
              )}
            </div>
            <p className="text-[10px] mt-1 ml-1" style={{ color: theme.colors.textSecondary }}>
              opcional — aparece para os participantes saberem como pagar
            </p>
          </div>
        </div>

        {/* Prévia */}
        <AnimatePresence>
          {homeTeam && awayTeam && homeTeam.id !== awayTeam.id && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(242,194,48,0.06)', border: `1px solid rgba(242,194,48,0.25)` }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.colors.primary }}>
                Prévia
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-4xl">{homeTeam.flag}</span>
                  <p className="text-xs font-bold text-center leading-tight" style={{ color: theme.colors.text }}>{homeTeam.name}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-black" style={{ color: theme.colors.border }}>×</span>
                  {date && time && (
                    <span className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>
                      {formatDatePreview(date)} {time}
                    </span>
                  )}
                  {valor && parseFloat(valor) > 0 && (
                    <span className="text-[10px] font-semibold mt-0.5" style={{ color: theme.colors.primary }}>
                      R$ {parseFloat(valor).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-4xl">{awayTeam.flag}</span>
                  <p className="text-xs font-bold text-center leading-tight" style={{ color: theme.colors.text }}>{awayTeam.name}</p>
                </div>
              </div>
              {organizer && (
                <p className="text-[10px] text-center mt-3" style={{ color: theme.colors.textSecondary }}>
                  Org: {organizer.name}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: theme.colors.dangerBg, color: theme.colors.danger, border: `1px solid ${theme.colors.dangerBorder}` }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="mt-auto pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!isReady || loading}
            className="w-full py-4 rounded-xl font-bold text-base transition-all"
            style={{
              background: isReady
                ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`
                : theme.colors.card,
              color: isReady ? theme.colors.background : theme.colors.textSecondary,
              boxShadow: isReady ? `0 4px 20px rgba(242,194,48,0.3)` : 'none',
              border: `1px solid ${isReady ? 'transparent' : theme.colors.cardBorder}`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (isEdit ? 'Salvando…' : 'Criando…') : (isEdit ? 'Salvar alterações' : 'Criar Bolão')}
          </motion.button>
        </div>
      </div>

      {/* Picker Sheet — Times ou Organizador */}
      <AnimatePresence>
        {picker && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => { setPicker(null); setSearch(''); }}
            />

            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-1/2 z-50 w-full flex flex-col"
              style={{
                transform: 'translateX(-50%)', maxWidth: 430, maxHeight: '80vh',
                background: '#0A1E10',
                borderTop: `1px solid ${theme.colors.cardBorder}`,
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
              }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: theme.colors.border }} />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <p className="font-bold text-base" style={{ color: theme.colors.text }}>
                  {picker === 'home'      ? 'Time da casa'
                   : picker === 'away'   ? 'Time visitante'
                   : 'Selecionar organizador'}
                </p>
                <button onClick={() => { setPicker(null); setSearch(''); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: theme.colors.inputBg }}>
                  <X size={15} style={{ color: theme.colors.textSecondary }} />
                </button>
              </div>

              <div className="px-5 pb-3">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.inputBorder}` }}>
                  <Search size={15} style={{ color: theme.colors.textSecondary }} />
                  <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={picker === 'organizer' ? 'Buscar usuário...' : 'Buscar time...'}
                    className="flex-1 bg-transparent outline-none text-sm" style={{ color: theme.colors.text }} />
                  {search && (
                    <button onClick={() => setSearch('')}>
                      <X size={13} style={{ color: theme.colors.textSecondary }} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-8">
                {picker === 'organizer' ? (
                  <UserList
                    users={filteredUsers}
                    selectedId={organizer?.id}
                    onSelect={handlePickOrganizer}
                  />
                ) : (
                  <>
                    {groupedTeams.selecoes.length > 0 && (
                      <TeamGroup label="Seleções" teams={groupedTeams.selecoes}
                        selected={picker === 'home' ? homeTeam?.id : awayTeam?.id}
                        onSelect={handlePickTeam} />
                    )}
                    {groupedTeams.clubes.length > 0 && (
                      <TeamGroup label="Clubes" teams={groupedTeams.clubes}
                        selected={picker === 'home' ? homeTeam?.id : awayTeam?.id}
                        onSelect={handlePickTeam} />
                    )}
                    {filteredTeams.length === 0 && <EmptySearch />}
                  </>
                )}
                {picker === 'organizer' && filteredUsers.length === 0 && <EmptySearch />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
            style={{ background: 'rgba(7,21,13,0.96)' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <CheckCircle size={80} style={{ color: theme.colors.primary }} />
            </motion.div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-black" style={{ color: theme.colors.text }}>
                {isEdit ? 'Bolão atualizado!' : 'Bolão criado!'}
              </h2>
              {homeTeam && awayTeam && (
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  {homeTeam.name} {homeTeam.flag} × {awayTeam.flag} {awayTeam.name}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TeamSlot({ label, team, onTap }: { label: string; team: TeamOption | null; onTap: () => void }) {
  return (
    <button onClick={onTap} className="flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all active:scale-95"
      style={{
        background: team ? 'rgba(242,194,48,0.08)' : theme.colors.inputBg,
        border: `1px solid ${team ? theme.colors.cardBorder : theme.colors.inputBorder}`,
        minHeight: 100,
      }}>
      {team ? (
        <>
          <span className="text-4xl leading-none">{team.flag}</span>
          <p className="text-xs font-bold text-center leading-tight" style={{ color: theme.colors.text }}>{team.name}</p>
          <p className="text-[10px]" style={{ color: theme.colors.primary }}>trocar</p>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: theme.colors.secondaryDark, border: `1px dashed ${theme.colors.border}` }}>
            ⚽
          </div>
          <p className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>{label}</p>
          <p className="text-[10px]" style={{ color: theme.colors.primary }}>selecionar</p>
        </>
      )}
    </button>
  );
}

function TeamGroup({ label, teams, selected, onSelect }: {
  label: string; teams: TeamOption[]; selected?: string; onSelect: (t: TeamOption) => void;
}) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.colors.textSecondary }}>{label}</p>
      <div className="flex flex-col gap-1">
        {teams.map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.98 }} onClick={() => onSelect(t)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
            style={{
              background: selected === t.id ? 'rgba(242,194,48,0.12)' : 'transparent',
              border: `1px solid ${selected === t.id ? theme.colors.cardBorder : 'transparent'}`,
            }}>
            <span className="text-2xl leading-none w-8 text-center">{t.flag}</span>
            <span className="text-sm font-medium flex-1" style={{ color: theme.colors.text }}>{t.name}</span>
            {selected === t.id && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: theme.colors.primary, color: theme.colors.background }}>✓</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function UserList({ users, selectedId, onSelect }: {
  users: UserSummary[]; selectedId?: string; onSelect: (u: UserSummary) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {users.map(u => (
        <motion.button key={u.id} whileTap={{ scale: 0.98 }} onClick={() => onSelect(u)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
          style={{
            background: selectedId === u.id ? 'rgba(242,194,48,0.12)' : 'transparent',
            border: `1px solid ${selectedId === u.id ? theme.colors.cardBorder : 'transparent'}`,
          }}>
          <img src={u.avatar} alt={u.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>{u.name}</p>
            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>@{u.username}</p>
          </div>
          {selectedId === u.id && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              style={{ background: theme.colors.primary, color: theme.colors.background }}>✓</div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="flex flex-col items-center py-10 gap-2">
      <span className="text-3xl">🔍</span>
      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Nenhum resultado encontrado</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDatePreview(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// Keep these exports to avoid unused warnings if needed elsewhere
export type { TeamOption };
export { isoToDateStr, isoToTimeStr };
