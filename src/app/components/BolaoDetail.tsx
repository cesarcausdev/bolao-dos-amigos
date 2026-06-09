import { useEffect, useState } from 'react';
import { ArrowLeft, Users, User } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { Classificacao } from './Classificacao';
import { PalpitesList } from './PalpitesList';
import type { Bolao, Participant, Screen } from './types';

interface BolaoDetailProps {
  bolao: Bolao;
  onNavigate: (screen: Screen, data?: unknown) => void;
  onBack: () => void;
  currentUserId?: string;
}

export function BolaoDetail({ bolao: initialBolao, onNavigate, onBack, currentUserId }: BolaoDetailProps) {
  const [activeTab, setActiveTab] = useState<'classificacao' | 'palpites'>('classificacao');
  const [bolao, setBolao] = useState<Bolao>(initialBolao);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.boloes.getDetail(initialBolao.id)
      .then(({ bolao: b, participants: p }) => {
        setBolao(b);
        setParticipants(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialBolao.id]);

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#0F172A' }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F2D1A 0%, #0F172A 100%)' }}>
        <button onClick={onBack} className="flex items-center gap-2 mb-6" style={{ color: '#94A3B8' }}>
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">{bolao.homeTeam.flag}</span>
            <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{bolao.homeTeam.name}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            {bolao.homeScore !== undefined ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black" style={{ color: '#22C55E' }}>{bolao.homeScore}</span>
                <span className="text-xl" style={{ color: '#94A3B8' }}>×</span>
                <span className="text-3xl font-black" style={{ color: '#22C55E' }}>{bolao.awayScore}</span>
              </div>
            ) : (
              <>
                <span className="text-2xl font-black" style={{ color: '#94A3B8' }}>×</span>
                <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{bolao.time}</span>
              </>
            )}
            <span className="text-xs" style={{ color: '#94A3B8' }}>{bolao.date}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">{bolao.awayTeam.flag}</span>
            <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{bolao.awayTeam.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <User size={12} style={{ color: '#94A3B8' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>Org: {bolao.organizer}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} style={{ color: '#94A3B8' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>{bolao.participants} participantes</span>
          </div>
        </div>
      </div>

      {/* CTA palpite */}
      {bolao.status === 'Aberto' && (
        <div className="px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('palpite', bolao)}
            className="w-full py-4 rounded-xl font-bold text-base"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#0F172A', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
          >
            ⚽ Fazer meu palpite
          </motion.button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex rounded-xl p-1" style={{ background: '#1E293B' }}>
          {(['classificacao', 'palpites'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: activeTab === tab ? '#22C55E' : 'transparent', color: activeTab === tab ? '#0F172A' : '#94A3B8' }}
            >
              {tab === 'classificacao' ? '🏆 Classificação' : '🎯 Palpites'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-3xl animate-spin">⚽</span>
          </div>
        ) : activeTab === 'classificacao' ? (
          <Classificacao participants={participants} currentUserId={currentUserId} embedded />
        ) : (
          <PalpitesList bolao={bolao} participants={participants} embedded />
        )}
      </div>
    </div>
  );
}
