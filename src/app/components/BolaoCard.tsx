import { Users, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { theme } from '../theme';
import type { Bolao, Screen } from './types';

interface BolaoCardProps {
  bolao: Bolao;
  onNavigate: (screen: Screen, data?: unknown) => void;
  index?: number;
}

const statusConfig = {
  'Aberto': { color: theme.colors.success, bg: 'rgba(0,210,106,0.12)' },
  'Em Andamento': { color: theme.colors.primary, bg: 'rgba(242,194,48,0.12)' },
  'Encerrado': { color: theme.colors.textSecondary, bg: 'rgba(214,214,214,0.08)' },
};

export function BolaoCard({ bolao, onNavigate, index = 0 }: BolaoCardProps) {
  const status = statusConfig[bolao.status];

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => onNavigate('bolao-detail', bolao)}
      className="w-full text-left rounded-2xl p-4 mb-3 transition-all active:scale-98"
      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}
    >
      {/* Teams row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-3xl">{bolao.homeTeam.flag}</span>
            <span className="text-xs font-semibold" style={{ color: theme.colors.text }}>{bolao.homeTeam.shortName}</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            {bolao.homeScore !== undefined ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black" style={{ color: theme.colors.primary }}>{bolao.homeScore}</span>
                <span className="text-sm" style={{ color: theme.colors.textSecondary }}>×</span>
                <span className="text-2xl font-black" style={{ color: theme.colors.primary }}>{bolao.awayScore}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold" style={{ color: theme.colors.textSecondary }}>VS</span>
                <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{bolao.time}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-3xl">{bolao.awayTeam.flag}</span>
            <span className="text-xs font-semibold" style={{ color: theme.colors.text }}>{bolao.awayTeam.shortName}</span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: theme.colors.textSecondary }} className="ml-3 flex-shrink-0" />
      </div>

      {/* Info strip — date + status only */}
      <div className="rounded-xl px-3 py-2 flex items-center justify-between"
        style={{ background: theme.colors.secondaryDark }}>
        <div className="flex items-center gap-1">
          <Clock size={11} style={{ color: theme.colors.textSecondary }} />
          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{bolao.date}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: status.bg }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
          <span className="text-xs font-medium" style={{ color: status.color }}>{bolao.status}</span>
        </div>
      </div>

      {/* Bottom row — participants + valor */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Users size={11} style={{ color: theme.colors.textSecondary }} />
          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{bolao.participants} participantes</span>
        </div>
        {bolao.valorBolao > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold" style={{ color: theme.colors.primary }}>
              R$ {bolao.valorBolao.toFixed(2)}
            </span>
            {bolao.paidCount > 0 && (
              <>
                <span className="text-xs" style={{ color: theme.colors.border }}>·</span>
                <span className="text-xs font-bold" style={{ color: theme.colors.primary }}>
                  🏆 R$ {(bolao.valorBolao * bolao.paidCount).toFixed(2)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}
