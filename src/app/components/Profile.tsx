import { LogOut, Trophy, Users, Star, ChevronRight, Settings, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import type { Screen, User } from './types';

interface ProfileProps {
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
  currentUser: User | null;
}

export function Profile({ onLogout, currentUser }: ProfileProps) {
  const stats = [
    { label: 'Pontos totais', value: currentUser?.points ?? 0, icon: '⭐', color: '#F59E0B' },
    { label: 'Bolões', value: currentUser?.boloesCount ?? 0, icon: '⚽', color: '#22C55E' },
    { label: 'Melhor posição', value: currentUser?.bestRank ? `#${currentUser.bestRank}` : '—', icon: '🏆', color: '#3B82F6' },
  ];

  const menuItems = [
    { icon: Settings, label: 'Configurações', color: '#94A3B8' },
    { icon: Shield, label: 'Privacidade', color: '#94A3B8' },
    { icon: Trophy, label: 'Minhas conquistas', color: '#F59E0B' },
    { icon: Users, label: 'Convidar amigos', color: '#22C55E' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#0F172A' }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-8 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F2D1A 0%, #0F172A 100%)' }}>
        <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-center pointer-events-none">⚽</div>
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`}
              alt={currentUser?.name}
              className="w-24 h-24 rounded-full object-cover border-4"
              style={{ borderColor: '#22C55E' }}
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#22C55E' }}>
              <Star size={14} style={{ color: '#0F172A' }} fill="#0F172A" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black" style={{ color: '#FFFFFF' }}>{currentUser?.name ?? '…'}</h2>
            <p className="text-sm" style={{ color: '#94A3B8' }}>@{currentUser?.username ?? ''}</p>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{ background: '#1E293B' }}
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-center leading-tight" style={{ color: '#94A3B8' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Menu */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#1E293B' }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-4 transition-all active:bg-white/5"
                style={{ borderBottom: i < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-sm font-medium text-left" style={{ color: '#FFFFFF' }}>{item.label}</span>
                <ChevronRight size={16} style={{ color: '#475569' }} />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <LogOut size={18} />
          Sair da conta
        </motion.button>
      </div>
    </div>
  );
}
