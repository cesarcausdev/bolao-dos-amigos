import { Home, Trophy, Users, User } from 'lucide-react';
import type { Screen } from './types';
import { motion } from 'motion/react';

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
      style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2 pb-safe"
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
                style={{ background: '#22C55E' }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
              />
            )}
            <Icon
              size={22}
              style={{ color: active_ ? '#22C55E' : '#94A3B8' }}
              strokeWidth={active_ ? 2.5 : 1.5}
            />
            <span
              className="text-[10px]"
              style={{ color: active_ ? '#22C55E' : '#94A3B8', fontWeight: active_ ? 600 : 400 }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
