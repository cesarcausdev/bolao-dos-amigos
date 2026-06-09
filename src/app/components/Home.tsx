import { useEffect, useState } from 'react';
import { Bell, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
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
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-11 h-11 rounded-full object-cover border-2"
              style={{ borderColor: theme.colors.primary }}
            />
            <div>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Olá,</p>
              <p className="font-bold text-base" style={{ color: theme.colors.text }}>{currentUser?.name ?? '…'} 👋</p>
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
            <Bell size={18} style={{ color: theme.colors.textSecondary }} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: theme.colors.success }} />
          </button>
        </div>

        {/* Points card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-2 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.secondaryDark} 100%)`, border: `1px solid ${theme.colors.cardBorder}` }}
        >
          <div className="absolute right-4 top-4 text-6xl opacity-10">🏆</div>
          <p className="text-xs font-medium mb-1" style={{ color: theme.colors.primary }}>Sua pontuação</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-black" style={{ color: theme.colors.primary }}>{currentUser?.points ?? 0}</span>
            <span className="text-sm mb-1" style={{ color: theme.colors.primaryDark }}>pts</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} style={{ color: theme.colors.primaryDark }} />
              <span className="text-xs" style={{ color: theme.colors.primaryDark }}>{currentUser?.bestRank ? `${currentUser.bestRank}º lugar geral` : '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} style={{ color: theme.colors.primaryDark }} />
              <span className="text-xs" style={{ color: theme.colors.primaryDark }}>{currentUser?.boloesCount ?? 0} bolões</span>
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
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `rgba(242,194,48,0.12)` }}>⚡</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5" style={{ color: theme.colors.primary }}>Próximo jogo</p>
              <p className="font-bold text-sm truncate" style={{ color: theme.colors.text }}>
                {nextMatch.homeTeam.flag} {nextMatch.homeTeam.name} × {nextMatch.awayTeam.name} {nextMatch.awayTeam.flag}
              </p>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{nextMatch.date} • {nextMatch.time}</p>
            </div>
            <ChevronRight size={16} style={{ color: theme.colors.textSecondary }} />
          </motion.button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex rounded-xl p-1" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
          {(['boloes', 'ranking'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)` : 'transparent',
                color: activeTab === tab ? theme.colors.background : theme.colors.textSecondary,
              }}
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
