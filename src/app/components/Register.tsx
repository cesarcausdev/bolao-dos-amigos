import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
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

const inputStyle = {
  background: theme.colors.inputBg,
  color: theme.colors.text,
  border: `1px solid ${theme.colors.inputBorder}`,
  backdropFilter: 'blur(8px)',
  fontSize: 15,
} as const;

export function Register({ onNavigate, onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!usernameEdited) setUsername(generateUsername(name));
  }, [name, usernameEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
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

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = theme.colors.inputBorderFocus);
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = theme.colors.inputBorder);

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm mx-auto"
      >
        <button onClick={() => onNavigate('login')} className="flex items-center gap-2 mb-8" style={{ color: theme.colors.textSecondary }}>
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: theme.colors.text }}>Criar conta</h1>
          <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Junte-se ao bolão dos seus amigos</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: theme.colors.dangerBg, color: theme.colors.danger, border: `1px solid ${theme.colors.dangerBorder}` }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {/* Username */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm" style={{ color: theme.colors.textSecondary }}>Username</label>
              {usernameEdited && (
                <button type="button" onClick={() => { setUsernameEdited(false); setUsername(generateUsername(name)); }}
                  className="text-xs font-medium" style={{ color: theme.colors.primary }}>
                  Gerar automático
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: theme.colors.primaryDark }}>@</span>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setUsernameEdited(true); }}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-8 pr-4 py-3 rounded-xl outline-none border transition-all"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: '#4B6B55' }}>Letras, números e _ apenas.</p>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Confirmar */}
          <div>
            <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>Confirmar senha</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !name || !username || !password || !confirm}
            className="w-full py-4 rounded-xl font-bold text-base mt-1 transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
              color: theme.colors.background,
              boxShadow: `0 4px 20px rgba(242,194,48,0.3)`,
              opacity: loading || !name || !username || !password || !confirm ? 0.6 : 1,
            }}
          >
            {loading ? 'Criando…' : 'Criar Conta'}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textSecondary }}>
          Já possui conta?{' '}
          <button onClick={() => onNavigate('login')} className="font-semibold" style={{ color: theme.colors.primary }}>
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  );
}
