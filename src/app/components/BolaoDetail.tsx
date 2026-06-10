import { useEffect, useState } from 'react';
import { ArrowLeft, Users, User, Pencil, Trophy, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
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
  const [activeTab, setActiveTab] = useState<'palpites' | 'classificacao'>('palpites');
  const [bolao, setBolao] = useState<Bolao>(initialBolao);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const [copiedPix, setCopiedPix] = useState(false);
  const [showResultSheet, setShowResultSheet] = useState(false);
  const [homeScoreInput, setHomeScoreInput] = useState('');
  const [awayScoreInput, setAwayScoreInput] = useState('');
  const [submittingResult, setSubmittingResult] = useState(false);
  const [resultError, setResultError] = useState('');

  const isAberto = bolao.status === 'Aberto';
  const isEncerrado = bolao.status === 'Encerrado';
  const isEmAndamento = bolao.status === 'Em Andamento';

  const canEdit = currentUserId && isAberto && (
    bolao.createdById === currentUserId ||
    bolao.organizerId === currentUserId
  );
  const canOrganize = !!(currentUserId && (
    bolao.createdById === currentUserId ||
    bolao.organizerId === currentUserId
  ));
  const canManageResult = canOrganize && !isAberto;

  const myParticipant = currentUserId
    ? participants.find(p => p.id === currentUserId)
    : undefined;
  const myPrediction = myParticipant?.prediction;

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = () => {
      api.boloes.getDetail(initialBolao.id)
        .then(({ bolao: b, participants: p }) => {
          if (cancelled) return;
          setBolao(b);
          setParticipants(p);
          if (b.status === 'Encerrado') setActiveTab('classificacao');
        })
        .catch(console.error)
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchDetail();
    const interval = setInterval(fetchDetail, 10_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [initialBolao.id]);

  const handlePaymentChange = (userId: string, pagou: boolean) => {
    setBolao(prev => ({
      ...prev,
      paidCount: pagou ? prev.paidCount + 1 : Math.max(0, prev.paidCount - 1),
    }));
  };

  function openResultSheet() {
    setHomeScoreInput('');
    setAwayScoreInput('');
    setResultError('');
    setShowResultSheet(true);
  }

  async function handleSetResultado() {
    const home = parseInt(homeScoreInput);
    const away = parseInt(awayScoreInput);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setResultError('Informe placares válidos.');
      return;
    }
    setSubmittingResult(true);
    setResultError('');
    try {
      await api.boloes.setResultado(bolao.id, home, away);
      const { bolao: b, participants: p } = await api.boloes.getDetail(bolao.id);
      setBolao(b);
      setParticipants(p);
      setShowResultSheet(false);
      setActiveTab('classificacao');
    } catch (e: unknown) {
      setResultError(e instanceof Error ? e.message : 'Erro ao finalizar bolão.');
    } finally {
      setSubmittingResult(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2" style={{ color: theme.colors.textSecondary }}>
            <ArrowLeft size={20} />
            <span className="text-sm">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            {canManageResult && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={openResultSheet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(242,194,48,0.15)', border: `1px solid rgba(242,194,48,0.4)`, color: theme.colors.primary }}
              >
                <Trophy size={12} />
                {isEncerrado ? 'Corrigir Resultado' : 'Incluir Resultado'}
              </motion.button>
            )}
            {canEdit && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => onNavigate('editar-bolao', bolao)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}`, color: theme.colors.primary }}
              >
                <Pencil size={12} />
                Editar
              </motion.button>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">{bolao.homeTeam.flag}</span>
            <p className="text-sm font-bold" style={{ color: theme.colors.text }}>{bolao.homeTeam.name}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            {bolao.homeScore !== undefined ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black" style={{ color: theme.colors.primary }}>{bolao.homeScore}</span>
                <span className="text-xl" style={{ color: theme.colors.textSecondary }}>×</span>
                <span className="text-3xl font-black" style={{ color: theme.colors.primary }}>{bolao.awayScore}</span>
              </div>
            ) : (
              <>
                <span className="text-2xl font-black" style={{ color: theme.colors.textSecondary }}>×</span>
                <span className="text-sm font-bold" style={{ color: theme.colors.primary }}>{bolao.time}</span>
              </>
            )}
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{bolao.date}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">{bolao.awayTeam.flag}</span>
            <p className="text-sm font-bold" style={{ color: theme.colors.text }}>{bolao.awayTeam.name}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <div className="flex items-center gap-1.5">
            <User size={12} style={{ color: theme.colors.textSecondary }} />
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Org: {bolao.organizer}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} style={{ color: theme.colors.textSecondary }} />
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{bolao.participants} participantes</span>
          </div>
          {bolao.valorBolao > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(242,194,48,0.12)', border: `1px solid rgba(242,194,48,0.25)` }}>
              <span className="text-xs font-bold" style={{ color: theme.colors.primary }}>
                R$ {bolao.valorBolao.toFixed(2)}
              </span>
              <span className="text-xs" style={{ color: 'rgba(242,194,48,0.5)' }}>·</span>
              <span className="text-xs font-bold" style={{ color: theme.colors.primary }}>
                🏆 R$ {(bolao.valorBolao * bolao.paidCount).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Palpite CTA */}
      {isAberto && !loading && (
        <div className="px-5 pb-4 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('palpite', { bolao, myPrediction })}
            className="w-full py-4 rounded-xl font-bold text-base"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
              color: theme.colors.background,
              boxShadow: `0 4px 20px rgba(242,194,48,0.3)`,
            }}
          >
            {myPrediction
              ? `✏️ Editar meu palpite (${bolao.homeTeam.flag} ${myPrediction.home} × ${myPrediction.away} ${bolao.awayTeam.flag})`
              : '⚽ Fazer meu palpite'}
          </motion.button>

          {bolao.pixKey && bolao.valorBolao > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(242,194,48,0.06)', border: `1px solid rgba(242,194,48,0.2)` }}>
              <span className="text-xl flex-shrink-0">💸</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: theme.colors.primary }}>
                  Pagamento — R$ {bolao.valorBolao.toFixed(2)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                    Pix: {bolao.pixKey}
                  </p>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(bolao.pixKey!);
                      setCopiedPix(true);
                      setTimeout(() => setCopiedPix(false), 2000);
                    }}
                    className="flex-shrink-0 p-1 rounded-lg transition-all active:scale-90"
                    style={{ color: copiedPix ? theme.colors.success : theme.colors.textSecondary }}
                  >
                    {copiedPix ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs — only when Encerrado */}
      {isEncerrado && (
        <div className="px-5 mb-4">
          <div className="flex rounded-xl p-1" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}>
            {(['palpites', 'classificacao'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)` : 'transparent',
                  color: activeTab === tab ? theme.colors.background : theme.colors.textSecondary,
                }}
              >
                {tab === 'palpites' ? '🎯 Palpites' : '🏆 Classificação'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-3xl animate-spin">⚽</span>
          </div>
        ) : isEncerrado ? (
          activeTab === 'palpites' ? (
            <PalpitesList
              bolao={bolao}
              participants={participants}
              embedded
              canManagePayments={canOrganize}
              bolaoId={bolao.id}
              currentUserId={currentUserId}
              onPaymentChange={handlePaymentChange}
            />
          ) : (
            <Classificacao
              participants={participants}
              currentUserId={currentUserId}
              embedded
              bolao={bolao}
              valorBolao={bolao.valorBolao}
              paidCount={bolao.paidCount}
            />
          )
        ) : (
          <PalpitesList
            bolao={bolao}
            participants={participants}
            embedded
            canManagePayments={canOrganize}
            bolaoId={bolao.id}
            currentUserId={currentUserId}
            onPaymentChange={handlePaymentChange}
          />
        )}
      </div>

      {/* Result Sheet */}
      <AnimatePresence>
        {showResultSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResultSheet(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed bottom-0 left-1/2 z-50 w-full rounded-t-3xl px-5 pt-5 pb-10"
              style={{ transform: 'translateX(-50%)', maxWidth: 430, background: theme.colors.secondary, border: `1px solid ${theme.colors.cardBorder}` }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: theme.colors.border }} />

              <h2 className="text-lg font-black mb-1" style={{ color: theme.colors.text }}>Incluir Resultado</h2>
              <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
                {bolao.homeTeam.name} vs {bolao.awayTeam.name}
              </p>

              {/* Score inputs */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{bolao.homeTeam.flag}</span>
                  <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>{bolao.homeTeam.shortName}</p>
                  <input
                    type="number"
                    min="0"
                    value={homeScoreInput}
                    onChange={e => setHomeScoreInput(e.target.value)}
                    placeholder="0"
                    className="w-20 h-16 text-center text-3xl font-black rounded-2xl outline-none"
                    style={{
                      background: theme.colors.card,
                      border: `2px solid ${homeScoreInput !== '' ? theme.colors.primary : theme.colors.cardBorder}`,
                      color: theme.colors.primary,
                    }}
                  />
                </div>

                <span className="text-2xl font-black mt-8" style={{ color: theme.colors.textSecondary }}>×</span>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{bolao.awayTeam.flag}</span>
                  <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>{bolao.awayTeam.shortName}</p>
                  <input
                    type="number"
                    min="0"
                    value={awayScoreInput}
                    onChange={e => setAwayScoreInput(e.target.value)}
                    placeholder="0"
                    className="w-20 h-16 text-center text-3xl font-black rounded-2xl outline-none"
                    style={{
                      background: theme.colors.card,
                      border: `2px solid ${awayScoreInput !== '' ? theme.colors.primary : theme.colors.cardBorder}`,
                      color: theme.colors.primary,
                    }}
                  />
                </div>
              </div>

              {resultError && (
                <p className="text-sm text-center mb-4" style={{ color: '#F87171' }}>{resultError}</p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSetResultado}
                disabled={submittingResult || homeScoreInput === '' || awayScoreInput === ''}
                className="w-full py-4 rounded-xl font-bold text-base mb-3"
                style={{
                  background: submittingResult || homeScoreInput === '' || awayScoreInput === ''
                    ? 'rgba(242,194,48,0.3)'
                    : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
                  color: theme.colors.background,
                  cursor: submittingResult || homeScoreInput === '' || awayScoreInput === '' ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingResult ? '⏳ Finalizando...' : '🏁 Finalizar Bolão'}
              </motion.button>

              <button
                onClick={() => setShowResultSheet(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ color: theme.colors.textSecondary }}
              >
                Cancelar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
