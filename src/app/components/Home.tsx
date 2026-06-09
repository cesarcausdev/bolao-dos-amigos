import { useEffect, useState } from 'react';
import { Bell, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { BoloesList } from './BoloesList';
import { Classificacao } from './Classificacao';
import type { Screen, Bolao, User } from './types';

interface HomeProps {
  onNavigate: (screen: Screen, data?: unknown) => void;
  currentUser: User | null;
}

export function Home({ onNavigate, currentUser }: HomeProps) {
  const [activeTab, setActiveTab] = useState<'boloes' | 'ranking'>('boloes');
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.boloes.getAll()
      .then(setBoloes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nextMatch = boloes.find(b => b.status === 'Aberto');

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#0F172A' }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`}
              alt={currentUser?.name}
              className="w-11 h-11 rounded-full object-cover border-2"
              style={{ borderColor: '#22C55E' }}
            />
            <div>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Olá,</p>
              <p className="font-bold text-base" style={{ color: '#FFFFFF' }}>{currentUser?.name ?? '…'} 👋</p>
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1E293B' }}>
            <Bell size={18} style={{ color: '#94A3B8' }} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
          </button>
        </div>

        {/* Points card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-2 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #16532A 0%, #1E4620 50%, #0F2D1A 100%)' }}
        >
          <div className="absolute right-4 top-4 text-6xl opacity-20">🏆</div>
          <p className="text-xs font-medium mb-1" style={{ color: '#86EFAC' }}>Sua pontuação</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-black" style={{ color: '#22C55E' }}>{currentUser?.points ?? 0}</span>
            <span className="text-sm mb-1" style={{ color: '#86EFAC' }}>pts</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} style={{ color: '#86EFAC' }} />
              <span className="text-xs" style={{ color: '#86EFAC' }}>{currentUser?.bestRank ? `${currentUser.bestRank}º lugar geral` : '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} style={{ color: '#86EFAC' }} />
              <span className="text-xs" style={{ color: '#86EFAC' }}>{currentUser?.boloesCount ?? 0} bolões</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Next match banner */}
      {nextMatch && (
        <div className="px-5 mb-4">
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => onNavigate('bolao-detail', nextMatch)}
            className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
            style={{ background: '#1E293B', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>⚡</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5" style={{ color: '#22C55E' }}>Próximo jogo</p>
              <p className="font-bold text-sm truncate" style={{ color: '#FFFFFF' }}>
                {nextMatch.homeTeam.flag} {nextMatch.homeTeam.name} × {nextMatch.awayTeam.name} {nextMatch.awayTeam.flag}
              </p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{nextMatch.date} • {nextMatch.time}</p>
            </div>
            <ChevronRight size={16} style={{ color: '#94A3B8' }} />
          </motion.button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex rounded-xl p-1" style={{ background: '#1E293B' }}>
          {(['boloes', 'ranking'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: activeTab === tab ? '#22C55E' : 'transparent', color: activeTab === tab ? '#0F172A' : '#94A3B8' }}
            >
              {tab === 'boloes' ? '⚽ Bolões' : '🏆 Classificação'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-3xl animate-spin">⚽</span>
          </div>
        ) : activeTab === 'boloes' ? (
          <BoloesList boloes={boloes} onNavigate={onNavigate} embedded />
        ) : (
          <Classificacao currentUserId={currentUser?.id} embedded />
        )}
      </div>
    </div>
  );
}
