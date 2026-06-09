import { Users, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { Bolao, Screen } from './types';

interface BolaoCardProps {
  bolao: Bolao;
  onNavigate: (screen: Screen, data?: unknown) => void;
  index?: number;
}

const statusConfig = {
  'Aberto': { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', dot: '#22C55E' },
  'Em Andamento': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', dot: '#F59E0B' },
  'Encerrado': { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', dot: '#94A3B8' },
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
      style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Teams row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Home team */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-3xl">{bolao.homeTeam.flag}</span>
            <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{bolao.homeTeam.shortName}</span>
          </div>

          {/* Score or VS */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {bolao.homeScore !== undefined ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black" style={{ color: '#FFFFFF' }}>{bolao.homeScore}</span>
                <span className="text-sm" style={{ color: '#94A3B8' }}>×</span>
                <span className="text-2xl font-black" style={{ color: '#FFFFFF' }}>{bolao.awayScore}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold" style={{ color: '#94A3B8' }}>VS</span>
                <span className="text-xs" style={{ color: '#94A3B8' }}>{bolao.time}</span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-3xl">{bolao.awayTeam.flag}</span>
            <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{bolao.awayTeam.shortName}</span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: '#475569' }} className="ml-3 flex-shrink-0" />
      </div>

      {/* Info row */}
      <div
        className="rounded-xl px-3 py-2 flex items-center justify-between"
        style={{ background: 'rgba(15,23,42,0.5)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock size={11} style={{ color: '#94A3B8' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>{bolao.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={11} style={{ color: '#94A3B8' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>{bolao.participants} participantes</span>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: status.bg }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
          <span className="text-xs font-medium" style={{ color: status.color }}>{bolao.status}</span>
        </div>
      </div>

      {/* Organizer */}
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xs" style={{ color: '#475569' }}>Organizado por</span>
        <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{bolao.organizer}</span>
      </div>
    </motion.button>
  );
}
