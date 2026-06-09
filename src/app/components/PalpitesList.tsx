import { motion } from 'motion/react';
import { theme } from '../theme';
import type { Bolao, Participant } from './types';

interface PalpitesListProps {
  bolao?: Bolao;
  participants?: Participant[];
  embedded?: boolean;
}

export function PalpitesList({ bolao, participants = [], embedded = false }: PalpitesListProps) {
  const withPredictions = participants.filter(p => p.prediction);

  return (
    <div className={embedded ? '' : 'flex flex-col min-h-screen pb-24 px-5 pt-12'}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: theme.colors.text }}>Palpites</h1>
          <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>O que cada um apostou</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {withPredictions.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: theme.colors.text }}>{p.name}</p>
              {p.prediction && bolao && (
                <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                  {bolao.homeTeam.flag} {p.prediction.home} × {p.prediction.away} {bolao.awayTeam.flag}
                </p>
              )}
            </div>
            <div className="px-2 py-1 rounded-lg" style={{ background: 'rgba(242,194,48,0.1)' }}>
              <span className="text-xs font-bold" style={{ color: theme.colors.primary }}>{p.points} pts</span>
            </div>
          </motion.div>
        ))}
        {withPredictions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-4xl">🎯</span>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Nenhum palpite ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
