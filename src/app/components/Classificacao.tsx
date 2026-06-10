import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { Participant } from './types';

interface ClassificacaoProps {
  participants?: Participant[];
  currentUserId?: string;
  embedded?: boolean;
  valorBolao?: number;
  paidCount?: number;
}

const medals = ['🥇', '🥈', '🥉'];
const medalColors = [theme.colors.primary, '#94A3B8', '#CD7F32'];

export function Classificacao({
  participants: propParticipants,
  currentUserId,
  embedded = false,
  valorBolao = 0,
  paidCount = 0,
}: ClassificacaoProps) {
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

  const maxPoints = sorted[0]?.points ?? 0;
  const winners = embedded && maxPoints > 0 ? sorted.filter(p => p.points === maxPoints) : [];
  const others = sorted.filter(p => !winners.find(w => w.id === p.id));

  const prizeTotal = valorBolao * paidCount;
  const prizePerWinner = winners.length > 0 && prizeTotal > 0 ? prizeTotal / winners.length : 0;

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
            {/* Top 3 podium — standalone only */}
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
                      {pos === 0 && (
                        <div className="relative">
                          <img src={sorted[0].avatar} alt={sorted[0].name} className={`${sizes[1]} rounded-full object-cover border-2`} style={{ borderColor: borders[1] }} />
                          <span className="absolute -top-2 -right-1 text-lg">👑</span>
                        </div>
                      )}
                      {pos !== 0 && (
                        <img src={sorted[pos].avatar} alt={sorted[pos].name} className={`${sizes[0]} rounded-full object-cover border-2`} style={{ borderColor: borders[colIdx] }} />
                      )}
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

            {/* Winners section — embedded bolão only */}
            {embedded && winners.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏆</span>
                  <h3 className="text-sm font-black" style={{ color: theme.colors.primary }}>
                    {winners.length === 1 ? 'Vencedor' : `Empate! ${winners.length} Vencedores`}
                  </h3>
                  {prizePerWinner > 0 && winners.length > 1 && (
                    <span className="text-xs ml-auto" style={{ color: theme.colors.textSecondary }}>
                      R$ {prizePerWinner.toFixed(2)} cada
                    </span>
                  )}
                </div>

                <div className={`flex gap-3 ${winners.length === 1 ? '' : 'flex-wrap'}`}>
                  {winners.map((w, i) => {
                    const isMe = w.id === currentUserId;
                    return (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, scale: 0.9, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                        className={winners.length === 1 ? 'w-full' : 'flex-1 min-w-[140px]'}
                        style={{
                          background: 'linear-gradient(135deg, rgba(242,194,48,0.14) 0%, rgba(242,194,48,0.06) 100%)',
                          border: `1.5px solid ${isMe ? theme.colors.primary : 'rgba(242,194,48,0.45)'}`,
                          borderRadius: 16,
                          padding: '16px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Glow */}
                        <div style={{
                          position: 'absolute', top: -20, right: -20,
                          width: 80, height: 80,
                          background: 'radial-gradient(circle, rgba(242,194,48,0.2) 0%, transparent 70%)',
                          borderRadius: '50%',
                        }} />

                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={w.avatar} alt={w.name}
                              className="w-12 h-12 rounded-full object-cover"
                              style={{ border: `2px solid ${theme.colors.primary}` }}
                            />
                            <span className="absolute -top-2 -right-1 text-base">👑</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-black truncate" style={{ color: theme.colors.text }}>{w.name}</p>
                              {isMe && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                                  style={{ background: 'rgba(242,194,48,0.2)', color: theme.colors.primary }}>
                                  você
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                              {w.points} pts
                            </p>
                          </div>
                        </div>

                        {prizePerWinner > 0 && (
                          <div className="mt-3 pt-3 flex items-center justify-center gap-1.5 rounded-xl"
                            style={{ background: 'rgba(242,194,48,0.12)', border: '1px solid rgba(242,194,48,0.2)', padding: '8px' }}>
                            <span className="text-sm font-black" style={{ color: theme.colors.primary }}>
                              🏆 R$ {prizePerWinner.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Others list */}
            {(embedded && others.length > 0 || !embedded) && (
              <>
                {embedded && winners.length > 0 && others.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px" style={{ background: theme.colors.cardBorder }} />
                    <span className="text-xs font-semibold px-2" style={{ color: theme.colors.textSecondary }}>
                      Classificação geral
                    </span>
                    <div className="flex-1 h-px" style={{ background: theme.colors.cardBorder }} />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {(embedded ? others : sorted).map((p, i) => {
                    const realRank = sorted.findIndex(s => s.id === p.id) + 1;
                    const isCurrentUser = p.id === currentUserId;
                    const isTop3 = realRank <= 3;
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
                          {isTop3 && !embedded
                            ? <span className="text-xl">{medals[realRank - 1]}</span>
                            : <span className="text-sm font-bold" style={{ color: theme.colors.textSecondary }}>#{realRank}</span>
                          }
                        </div>
                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover"
                          style={{ border: `2px solid ${isCurrentUser ? theme.colors.primary : 'transparent'}` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: isCurrentUser ? theme.colors.primary : theme.colors.text }}>
                            {p.name}{isCurrentUser && ' (você)'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: isTop3 && !embedded ? medalColors[realRank - 1] : theme.colors.text }}>
                            {p.points}
                          </p>
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
          </>
        )}
      </div>
    </div>
  );
}
