import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import type { Screen, User } from './types';

interface RegisterProps {
  onNavigate: (screen: Screen) => void;
  onRegister: (user: User, token: string) => void;
}

function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
}

export function Register({ onNavigate, onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!usernameEdited) {
      setUsername(generateUsername(name));
    }
  }, [name, usernameEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user, token } = await api.auth.register(name, username, password);
      onRegister(user, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8" style={{ background: '#0F172A' }}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm mx-auto"
      >
        <button onClick={() => onNavigate('login')} className="flex items-center gap-2 mb-8" style={{ color: '#94A3B8' }}>
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-black" style={{ color: '#FFFFFF' }}>Criar conta</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Junte-se ao bolão dos seus amigos</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
              style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
              onFocus={e => (e.target.style.borderColor = '#22C55E')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* Username */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm" style={{ color: '#94A3B8' }}>Username</label>
              {usernameEdited && (
                <button
                  type="button"
                  onClick={() => { setUsernameEdited(false); setUsername(generateUsername(name)); }}
                  className="text-xs"
                  style={{ color: '#22C55E' }}
                >
                  Gerar automático
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#475569' }}>@</span>
              <input
                type="text"
                value={username}
                onChange={e => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setUsernameEdited(true);
                }}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-8 pr-4 py-3 rounded-xl outline-none border transition-all"
                style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
                onFocus={e => (e.target.style.borderColor = '#22C55E')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>Gerado a partir do nome. Letras, números e _ apenas.</p>
          </div>

          {/* Senha */}
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

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Confirmar senha</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
              style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
              onFocus={e => (e.target.style.borderColor = '#22C55E')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name || !username || !password || !confirm}
            className="w-full py-4 rounded-xl font-bold text-base mt-2 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#0F172A', boxShadow: '0 4px 20px rgba(34,197,94,0.3)', opacity: loading || !name || !username || !password || !confirm ? 0.6 : 1 }}
          >
            {loading ? 'Criando…' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: '#94A3B8' }}>
          Já possui conta?{' '}
          <button onClick={() => onNavigate('login')} className="font-semibold" style={{ color: '#22C55E' }}>
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  );
}
