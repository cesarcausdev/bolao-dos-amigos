import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle } from 'lucide-react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { Bolao, Participant } from './types';

interface PalpitesListProps {
  bolao?: Bolao;
  participants?: Participant[];
  embedded?: boolean;
  canManagePayments?: boolean;
  bolaoId?: string;
  currentUserId?: string;
  onPaymentChange?: (userId: string, pagou: boolean) => void;
}

export function PalpitesList({
  bolao,
  participants: initialParticipants = [],
  embedded = false,
  canManagePayments = false,
  bolaoId,
  currentUserId,
  onPaymentChange,
}: PalpitesListProps) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  // Always sync from parent (BolaoDetail polls and passes fresh data)
  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  const isAberto = bolao?.status === 'Aberto';

  async function handleTogglePagou(participant: Participant) {
    if (!bolaoId || !canManagePayments || toggling.has(participant.id)) return;

    const newPagou = !participant.pagou;
    setToggling(prev => new Set(prev).add(participant.id));
    setParticipants(prev =>
      prev.map(p => p.id === participant.id ? { ...p, pagou: newPagou } : p)
    );

    try {
      await api.boloes.updatePagamento(bolaoId, participant.id, newPagou);
      onPaymentChange?.(participant.id, newPagou);
    } catch {
      setParticipants(prev =>
        prev.map(p => p.id === participant.id ? { ...p, pagou: !newPagou } : p)
      );
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(participant.id); return s; });
    }
  }

  const withActivity = participants.filter(p => p.prediction || p.pagou);
  const displayList = withActivity.length > 0 ? withActivity : participants;

  return (
    <div className={embedded ? '' : 'flex flex-col min-h-screen pb-24 px-5 pt-12'}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: theme.colors.text }}>Palpites</h1>
          <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>O que cada um apostou</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {displayList.map((p, i) => {
          const isMe = p.id === currentUserId;
          const showPrediction = p.prediction && (!isAberto || isMe);
          const palpitou = !!p.prediction;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: isMe
                  ? 'rgba(242,194,48,0.06)'
                  : theme.colors.card,
                border: `1px solid ${isMe ? 'rgba(242,194,48,0.25)' : theme.colors.cardBorder}`,
              }}
            >
              <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>{p.name}</p>
                  {isMe && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(242,194,48,0.15)', color: theme.colors.primary }}>
                      você
                    </span>
                  )}
                </div>

                {showPrediction && bolao ? (
                  <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                    {bolao.homeTeam.flag} {p.prediction!.home} × {p.prediction!.away} {bolao.awayTeam.flag}
                  </p>
                ) : palpitou ? (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(34,197,94,0.8)' }}>
                    ✓ Palpitou
                  </p>
                ) : (
                  <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                    Sem palpite
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!isAberto && (
                  <div className="px-2 py-1 rounded-lg" style={{ background: 'rgba(242,194,48,0.1)' }}>
                    <span className="text-xs font-bold" style={{ color: theme.colors.primary }}>{p.points} pts</span>
                  </div>
                )}

                {/* Payment status / toggle */}
                {canManagePayments ? (
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleTogglePagou(p)}
                    disabled={toggling.has(p.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all"
                    style={{
                      background: p.pagou ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${p.pagou ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)'}`,
                      opacity: toggling.has(p.id) ? 0.6 : 1,
                    }}
                  >
                    {p.pagou ? (
                      <CheckCircle2 size={14} style={{ color: 'rgb(34,197,94)' }} />
                    ) : (
                      <Circle size={14} style={{ color: theme.colors.textSecondary }} />
                    )}
                    <span className="text-xs font-semibold"
                      style={{ color: p.pagou ? 'rgb(34,197,94)' : theme.colors.textSecondary }}>
                      {p.pagou ? 'Pago' : 'Pendente'}
                    </span>
                  </motion.button>
                ) : (
                  p.pagou ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <CheckCircle2 size={12} style={{ color: 'rgb(34,197,94)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'rgb(34,197,94)' }}>Pago</span>
                    </div>
                  ) : null
                )}
              </div>
            </motion.div>
          );
        })}

        {displayList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-4xl">🎯</span>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Nenhum palpite ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
