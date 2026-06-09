import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { Participant } from './types';

interface ClassificacaoProps {
  participants?: Participant[];
  currentUserId?: string;
  embedded?: boolean;
}

const medals = ['🥇', '🥈', '🥉'];
const medalColors = [theme.colors.primary, '#94A3B8', '#CD7F32'];

export function Classificacao({ participants: propParticipants, currentUserId, embedded = false }: ClassificacaoProps) {
  const [participants, setParticipants] = useState<Participant[]>(propParticipants ?? []);
  const [loading, setLoading] = useState(!propParticipants && !embedded);

  useEffect(() => {
    if (propParticipants !== undefined) { setParticipants(propParticipants); return; }
    if (embedded) return;
    api.ranking.getGlobal()
      .then(setParticipants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [propParticipants, embedded]);

  const sorted = [...participants].sort((a, b) => b.points - a.points);

  return (
    <div className={embedded ? '' : 'flex flex-col min-h-screen pb-24'}>
      {!embedded && (
        <div className="px-5 pt-12 pb-4">
          <h1 className="text-2xl font-black mb-1" style={{ color: theme.colors.text }}>Classificação</h1>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Ranking geral dos jogadores</p>
        </div>
      )}

      <div className={embedded ? '' : 'px-5'}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-3xl animate-spin">⚽</span>
          </div>
        ) : (
          <>
            {/* Top 3 podium (standalone only) */}
            {!embedded && sorted.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-6 px-2">
                {[1, 0, 2].map((pos, colIdx) => {
                  const heights = [64, 96, 48];
                  const sizes = ['w-14 h-14', 'w-16 h-16', 'w-14 h-14'];
                  const borders = ['#94A3B8', theme.colors.primary, '#CD7F32'];
                  const bgGradients = [
                    theme.colors.card,
                    `linear-gradient(180deg, ${theme.colors.secondary} 0%, ${theme.colors.secondaryDark} 100%)`,
                    theme.colors.card,
                  ];
                  return (
                    <motion.div key={pos} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: [0.15, 0.05, 0.25][colIdx] }}
                      className="flex flex-col items-center gap-2 flex-1">
                      {pos === 0 && <div className="relative">
                        <img src={sorted[0].avatar} alt={sorted[0].name} className={`${sizes[1]} rounded-full object-cover border-2`} style={{ borderColor: borders[1] }} />
                        <span className="absolute -top-2 -right-1 text-lg">👑</span>
                      </div>}
                      {pos !== 0 && <img src={sorted[pos].avatar} alt={sorted[pos].name} className={`${sizes[0]} rounded-full object-cover border-2`} style={{ borderColor: borders[colIdx] }} />}
                      <span className="text-xl">{medals[pos]}</span>
                      <p className="text-xs font-semibold text-center" style={{ color: theme.colors.text }}>{sorted[pos].name}</p>
                      <div className="w-full rounded-t-xl flex items-center justify-center" style={{ height: heights[colIdx], background: bgGradients[colIdx], border: `1px solid ${theme.colors.cardBorder}` }}>
                        <span className="text-sm font-bold" style={{ color: medalColors[pos] }}>{sorted[pos].points} pts</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* List */}
            <div className="flex flex-col gap-2">
              {sorted.map((p, i) => {
                const isCurrentUser = p.id === currentUserId;
                const isTop3 = i < 3;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: isCurrentUser ? `rgba(242,194,48,0.10)` : theme.colors.card,
                      border: `1px solid ${isCurrentUser ? theme.colors.primary : theme.colors.cardBorder}`,
                    }}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {isTop3 ? <span className="text-xl">{medals[i]}</span> : <span className="text-sm font-bold" style={{ color: theme.colors.textSecondary }}>#{i + 1}</span>}
                    </div>
                    <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover"
                      style={{ border: `2px solid ${isCurrentUser ? theme.colors.primary : 'transparent'}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: isCurrentUser ? theme.colors.primary : theme.colors.text }}>
                        {p.name} {isCurrentUser && '(você)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: isTop3 ? medalColors[i] : theme.colors.text }}>{p.points}</p>
                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>pts</p>
                    </div>
                  </motion.div>
                );
              })}
              {sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-4xl">🏆</span>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Nenhum participante ainda</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
