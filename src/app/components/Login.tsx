import { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import type { Screen, User } from './types';

interface LoginProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (user: User, token: string) => void;
}

export function Login({ onNavigate, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const { user, token } = await api.auth.login(email, password);
      onLogin(user, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0F172A' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-5xl"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', boxShadow: '0 8px 32px rgba(34,197,94,0.3)' }}
          >
            ⚽
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#FFFFFF' }}>Bolão</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>dos Amigos</p>
        </div>

        <div
          className="w-full rounded-2xl mb-8 overflow-hidden relative flex items-center justify-center"
          style={{ height: 160, background: 'linear-gradient(135deg, #1E293B 0%, #0F3460 100%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-30">
            {['🏆', '⚽', '🎯', '📊', '🥇'].map((e, i) => (
              <span key={i} className="text-4xl">{e}</span>
            ))}
          </div>
          <div className="relative text-center">
            <p className="text-lg font-bold" style={{ color: '#22C55E' }}>Bem-vindo de volta!</p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Faça seus palpites e ganhe pontos</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
              style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
              onFocus={e => (e.target.style.borderColor = '#22C55E')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
              style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
              onFocus={e => (e.target.style.borderColor = '#22C55E')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base mt-2 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#0F172A', boxShadow: '0 4px 20px rgba(34,197,94,0.3)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="w-full py-4 rounded-xl font-semibold text-base border transition-all active:scale-95"
            style={{ background: 'transparent', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Criar Conta
          </button>
        </form>
      </motion.div>
    </div>
  );
}
