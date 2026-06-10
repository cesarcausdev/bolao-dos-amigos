import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { Bolao, Screen } from './types';

interface PalpiteProps {
  bolao: Bolao;
  myPrediction?: { home: number; away: number };
  onBack: () => void;
  onNavigate: (screen: Screen, data?: unknown) => void;
}

export function Palpite({ bolao, myPrediction, onBack, onNavigate }: PalpiteProps) {
  const isEdit = !!myPrediction;
  const [homeGoals, setHomeGoals] = useState<number | ''>(myPrediction?.home ?? '');
  const [awayGoals, setAwayGoals] = useState<number | ''>(myPrediction?.away ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (homeGoals === '' || awayGoals === '') return;
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.boloes.updatePalpite(bolao.id, homeGoals, awayGoals);
      } else {
        await api.boloes.submitPalpite(bolao.id, homeGoals, awayGoals);
      }
      setSubmitted(true);
      setTimeout(() => onNavigate('bolao-detail', bolao), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Erro ao ${isEdit ? 'atualizar' : 'registrar'} palpite.`);
    } finally {
      setLoading(false);
    }
  };

  const adjust = (setter: (v: number) => void, current: number | '', delta: number) => {
    setter(Math.max(0, Math.min(20, (current === '' ? 0 : current) + delta)));
  };

  const btnReady = homeGoals !== '' && awayGoals !== '';

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="px-5 pt-10 pb-4">
        <button onClick={onBack} className="flex items-center gap-2 mb-6" style={{ color: theme.colors.textSecondary }}>
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>
        <h1 className="text-2xl font-black" style={{ color: theme.colors.text }}>
          {isEdit ? 'Editar palpite' : 'Seu palpite'}
        </h1>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{bolao.date} • {bolao.time}</p>
      </div>

      <div className="flex-1 px-5 flex flex-col">
        <div className="rounded-2xl p-6 mb-6" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-5xl">{bolao.homeTeam.flag}</span>
              <p className="text-sm font-bold text-center" style={{ color: theme.colors.text }}>{bolao.homeTeam.name}</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => adjust(v => setHomeGoals(v), homeGoals, -1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.07)', color: theme.colors.text }}>−</button>
                <div className="w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-black"
                  style={{ background: theme.colors.secondaryDark, color: theme.colors.primary }}>
                  {homeGoals === '' ? '—' : homeGoals}
                </div>
                <button onClick={() => adjust(v => setHomeGoals(v), homeGoals, 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`, color: theme.colors.background }}>+</button>
              </div>
            </div>

            <span className="text-2xl font-black" style={{ color: theme.colors.border }}>×</span>

            {/* Away */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-5xl">{bolao.awayTeam.flag}</span>
              <p className="text-sm font-bold text-center" style={{ color: theme.colors.text }}>{bolao.awayTeam.name}</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => adjust(v => setAwayGoals(v), awayGoals, -1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.07)', color: theme.colors.text }}>−</button>
                <div className="w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-black"
                  style={{ background: theme.colors.secondaryDark, color: theme.colors.primary }}>
                  {awayGoals === '' ? '—' : awayGoals}
                </div>
                <button onClick={() => adjust(v => setAwayGoals(v), awayGoals, 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`, color: theme.colors.background }}>+</button>
              </div>
            </div>
          </div>
        </div>

        {btnReady && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
            style={{ background: 'rgba(242,194,48,0.08)', border: `1px solid ${theme.colors.cardBorder}` }}>
            <span className="text-xl">🎯</span>
            <p className="text-sm font-medium" style={{ color: theme.colors.primary }}>
              {bolao.homeTeam.name} {homeGoals} × {awayGoals} {bolao.awayTeam.name}
            </p>
          </motion.div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: theme.colors.dangerBg, color: theme.colors.danger, border: `1px solid ${theme.colors.dangerBorder}` }}>
            {error}
          </div>
        )}

        <div className="mt-auto pb-4">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm}
            disabled={!btnReady || loading}
            className="w-full py-4 rounded-xl font-bold text-base transition-all"
            style={{
              background: btnReady ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)` : theme.colors.card,
              color: btnReady ? theme.colors.background : theme.colors.textSecondary,
              boxShadow: btnReady ? `0 4px 20px rgba(242,194,48,0.3)` : 'none',
              border: `1px solid ${btnReady ? 'transparent' : theme.colors.cardBorder}`,
              opacity: loading ? 0.7 : 1,
            }}>
            {loading
              ? (isEdit ? 'Salvando…' : 'Registrando…')
              : (isEdit ? 'Salvar alteração' : 'Confirmar Palpite')}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(7,21,13,0.96)' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <CheckCircle size={80} style={{ color: theme.colors.primary }} />
            </motion.div>
            <h2 className="text-2xl font-black" style={{ color: theme.colors.text }}>
              {isEdit ? 'Palpite atualizado!' : 'Palpite registrado!'}
            </h2>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              {bolao.homeTeam.name} {homeGoals} × {awayGoals} {bolao.awayTeam.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
