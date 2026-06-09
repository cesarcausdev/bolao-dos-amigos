import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import type { Bolao, Screen } from './types';

interface PalpiteProps {
  bolao: Bolao;
  onBack: () => void;
  onNavigate: (screen: Screen, data?: unknown) => void;
}

export function Palpite({ bolao, onBack, onNavigate }: PalpiteProps) {
  const [homeGoals, setHomeGoals] = useState<number | ''>('');
  const [awayGoals, setAwayGoals] = useState<number | ''>('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (homeGoals === '' || awayGoals === '') return;
    setLoading(true);
    setError('');
    try {
      await api.boloes.submitPalpite(bolao.id, homeGoals, awayGoals);
      setSubmitted(true);
      setTimeout(() => onNavigate('bolao-detail', bolao), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar palpite.');
    } finally {
      setLoading(false);
    }
  };

  const adjust = (setter: (v: number) => void, current: number | '', delta: number) => {
    const val = current === '' ? 0 : current;
    setter(Math.max(0, Math.min(20, val + delta)));
  };

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#0F172A' }}>
      <div className="px-5 pt-10 pb-4">
        <button onClick={onBack} className="flex items-center gap-2 mb-6" style={{ color: '#94A3B8' }}>
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>
        <h1 className="text-2xl font-black" style={{ color: '#FFFFFF' }}>Seu palpite</h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>{bolao.date} • {bolao.time}</p>
      </div>

      <div className="flex-1 px-5 flex flex-col">
        {/* Match card */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-5xl">{bolao.homeTeam.flag}</span>
              <p className="text-sm font-bold text-center" style={{ color: '#FFFFFF' }}>{bolao.homeTeam.name}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => adjust(v => setHomeGoals(v), homeGoals, -1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}
                >−</button>
                <div className="w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-black" style={{ background: '#0F172A', color: '#22C55E' }}>
                  {homeGoals === '' ? '—' : homeGoals}
                </div>
                <button
                  onClick={() => adjust(v => setHomeGoals(v), homeGoals, 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: '#22C55E', color: '#0F172A' }}
                >+</button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black" style={{ color: '#475569' }}>×</span>
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-5xl">{bolao.awayTeam.flag}</span>
              <p className="text-sm font-bold text-center" style={{ color: '#FFFFFF' }}>{bolao.awayTeam.name}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => adjust(v => setAwayGoals(v), awayGoals, -1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}
                >−</button>
                <div className="w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-black" style={{ background: '#0F172A', color: '#22C55E' }}>
                  {awayGoals === '' ? '—' : awayGoals}
                </div>
                <button
                  onClick={() => adjust(v => setAwayGoals(v), awayGoals, 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: '#22C55E', color: '#0F172A' }}
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {homeGoals !== '' && awayGoals !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <span className="text-xl">🎯</span>
            <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
              Seu palpite: {bolao.homeTeam.name} {homeGoals} × {awayGoals} {bolao.awayTeam.name}
            </p>
          </motion.div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <div className="mt-auto pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={homeGoals === '' || awayGoals === '' || loading}
            className="w-full py-4 rounded-xl font-bold text-base transition-all"
            style={{
              background: homeGoals !== '' && awayGoals !== '' ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' : '#1E293B',
              color: homeGoals !== '' && awayGoals !== '' ? '#0F172A' : '#475569',
              boxShadow: homeGoals !== '' && awayGoals !== '' ? '0 4px 20px rgba(34,197,94,0.3)' : 'none',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Registrando…' : 'Confirmar Palpite'}
          </motion.button>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(15,23,42,0.95)' }}
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <CheckCircle size={80} style={{ color: '#22C55E' }} />
            </motion.div>
            <h2 className="text-2xl font-black" style={{ color: '#FFFFFF' }}>Palpite registrado!</h2>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {bolao.homeTeam.name} {homeGoals} × {awayGoals} {bolao.awayTeam.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
