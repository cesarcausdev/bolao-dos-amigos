import { Home, Trophy, Users, User } from 'lucide-react';
import { motion } from 'motion/react';
import { theme } from '../theme';
import type { Screen } from './types';

interface BottomNavProps {
  active: string;
  onNavigate: (screen: Screen) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home, screen: 'home' as Screen },
  { id: 'classificacao', label: 'Ranking', icon: Trophy, screen: 'classificacao' as Screen },
  { id: 'boloes', label: 'Bolões', icon: Users, screen: 'boloes' as Screen },
  { id: 'profile', label: 'Perfil', icon: User, screen: 'profile' as Screen },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const isActive = (id: string) =>
    active === id ||
    (id === 'boloes' && ['bolao-detail', 'palpite', 'bolao-ranking', 'palpites-list'].includes(active));

  return (
    <div
      className="flex justify-around items-center py-2 pb-safe w-full"
      style={{ background: theme.colors.navBg, borderTop: `1px solid ${theme.colors.navBorder}`, backdropFilter: 'blur(16px)' }}
    >
      {navItems.map((item) => {
        const active_ = isActive(item.id);
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.screen)}
            className="flex flex-col items-center gap-1 px-4 py-1 relative"
          >
            {active_ && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: theme.colors.primary }}
              />
            )}
            <Icon
              size={22}
              style={{ color: active_ ? theme.colors.primary : theme.colors.textSecondary }}
              strokeWidth={active_ ? 2.5 : 1.5}
            />
            <span
              className="text-[10px]"
              style={{ color: active_ ? theme.colors.primary : theme.colors.textSecondary, fontWeight: active_ ? 600 : 400 }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
