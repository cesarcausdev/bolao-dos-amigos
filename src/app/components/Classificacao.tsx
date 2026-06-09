import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import type { Participant } from './types';

interface ClassificacaoProps {
  participants?: Participant[];
  currentUserId?: string;
  embedded?: boolean;
}

const medals = ['🥇', '🥈', '🥉'];
const medalColors = ['#F59E0B', '#94A3B8', '#CD7F32'];

export function Classificacao({ participants: propParticipants, currentUserId, embedded = false }: ClassificacaoProps) {
  const [participants, setParticipants] = useState<Participant[]>(propParticipants ?? []);
  const [loading, setLoading] = useState(!propParticipants && !embedded);

  useEffect(() => {
    if (propParticipants !== undefined) {
      setParticipants(propParticipants);
      return;
    }
    if (embedded) return;
    api.ranking.getGlobal()
      .then(setParticipants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [propParticipants, embedded]);

  const sorted = [...participants].sort((a, b) => b.points - a.points);

  return (
    <div className={embedded ? '' : 'flex flex-col min-h-screen pb-20'} style={embedded ? {} : { background: '#0F172A' }}>
      {!embedded && (
        <div className="px-5 pt-10 pb-4">
          <h1 className="text-2xl font-black mb-1" style={{ color: '#FFFFFF' }}>Classificação</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>Ranking geral dos jogadores</p>
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
                {/* 2nd */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="flex flex-col items-center gap-2 flex-1">
                  <img src={sorted[1].avatar} alt={sorted[1].name} className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: '#94A3B8' }} />
                  <span className="text-xl">🥈</span>
                  <p className="text-xs font-semibold text-center" style={{ color: '#FFFFFF' }}>{sorted[1].name}</p>
                  <div className="w-full h-16 rounded-t-xl flex items-center justify-center" style={{ background: '#1E293B' }}>
                    <span className="text-sm font-bold" style={{ color: '#94A3B8' }}>{sorted[1].points} pts</span>
                  </div>
                </motion.div>
                {/* 1st */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative">
                    <img src={sorted[0].avatar} alt={sorted[0].name} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: '#F59E0B' }} />
                    <span className="absolute -top-2 -right-1 text-lg">👑</span>
                  </div>
                  <span className="text-2xl">🥇</span>
                  <p className="text-xs font-bold text-center" style={{ color: '#FFFFFF' }}>{sorted[0].name}</p>
                  <div className="w-full h-24 rounded-t-xl flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #78350F 0%, #1E293B 100%)' }}>
                    <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>{sorted[0].points} pts</span>
                  </div>
                </motion.div>
                {/* 3rd */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="flex flex-col items-center gap-2 flex-1">
                  <img src={sorted[2].avatar} alt={sorted[2].name} className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: '#CD7F32' }} />
                  <span className="text-xl">🥉</span>
                  <p className="text-xs font-semibold text-center" style={{ color: '#FFFFFF' }}>{sorted[2].name}</p>
                  <div className="w-full h-12 rounded-t-xl flex items-center justify-center" style={{ background: '#1E293B' }}>
                    <span className="text-sm font-bold" style={{ color: '#CD7F32' }}>{sorted[2].points} pts</span>
                  </div>
                </motion.div>
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
                      background: isCurrentUser ? 'rgba(34,197,94,0.1)' : '#1E293B',
                      border: isCurrentUser ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                    }}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {isTop3 ? (
                        <span className="text-xl">{medals[i]}</span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: '#94A3B8' }}>#{i + 1}</span>
                      )}
                    </div>
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ border: isCurrentUser ? '2px solid #22C55E' : '2px solid transparent' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: isCurrentUser ? '#22C55E' : '#FFFFFF' }}>
                        {p.name} {isCurrentUser && '(você)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: isTop3 ? medalColors[i] : '#FFFFFF' }}>{p.points}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>pts</p>
                    </div>
                  </motion.div>
                );
              })}

              {sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-4xl">🏆</span>
                  <p className="text-sm" style={{ color: '#94A3B8' }}>Nenhum participante ainda</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
