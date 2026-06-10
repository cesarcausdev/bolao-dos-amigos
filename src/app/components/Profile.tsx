import { useEffect, useState } from 'react';
import { LogOut, Trophy, Users, Star, ChevronRight, UserCog, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { Screen, User } from './types';

interface ProfileProps {
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
  currentUser: User | null;
}

export function Profile({ onLogout, onNavigate, currentUser }: ProfileProps) {
  const [liveUser, setLiveUser] = useState<User | null>(currentUser);

  useEffect(() => {
    api.profile.get()
      .then(setLiveUser)
      .catch(console.error);
  }, []);

  const stats = [
    { label: 'Pontos totais', value: liveUser?.points ?? 0, icon: '⭐', color: theme.colors.primary },
    { label: 'Bolões', value: liveUser?.boloesCount ?? 0, icon: '⚽', color: theme.colors.success },
    { label: 'Melhor posição', value: liveUser?.bestRank ? `#${liveUser.bestRank}` : '—', icon: '🏆', color: theme.colors.primaryLight },
  ];

  const menuItems: { icon: typeof UserCog; label: string; color: string; action?: () => void }[] = [
    { icon: UserCog, label: 'Editar perfil', color: theme.colors.primary, action: () => onNavigate('edit-profile') },
    { icon: Shield, label: 'Privacidade', color: theme.colors.textSecondary },
    { icon: Trophy, label: 'Minhas conquistas', color: theme.colors.primary },
    { icon: Users, label: 'Convidar amigos', color: theme.colors.success },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`}
              alt={currentUser?.name}
              className="w-24 h-24 rounded-full object-cover border-4"
              style={{ borderColor: theme.colors.primary }}
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)` }}>
              <Star size={14} style={{ color: theme.colors.background }} fill={theme.colors.background} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black" style={{ color: theme.colors.text }}>{currentUser?.name ?? '…'}</h2>
            <p className="text-sm font-medium" style={{ color: theme.colors.primary }}>@{currentUser?.username ?? ''}</p>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-center leading-tight" style={{ color: theme.colors.textSecondary }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Menu */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-4 transition-all active:bg-white/5"
                style={{ borderBottom: i < menuItems.length - 1 ? `1px solid ${theme.colors.cardBorder}` : 'none' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-sm font-medium text-left" style={{ color: theme.colors.text }}>{item.label}</span>
                <ChevronRight size={16} style={{ color: theme.colors.border }} />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={onLogout}
          className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
          style={{ background: theme.colors.dangerBg, color: theme.colors.danger, border: `1px solid ${theme.colors.dangerBorder}` }}>
          <LogOut size={18} />
          Sair da conta
        </motion.button>
      </div>
    </div>
  );
}
