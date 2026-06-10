import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { Screen, User } from './types';

interface LoginProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (user: User, token: string) => void;
}

export function Login({ onNavigate, onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      const { user, token } = await api.auth.login(username, password);
      onLogin(user, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-end px-6 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mx-auto"
      >
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: theme.colors.dangerBg, color: theme.colors.danger, border: `1px solid ${theme.colors.dangerBorder}` }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              placeholder="Username"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-4 py-4 rounded-xl outline-none border transition-all text-sm"
              style={{
                background: theme.colors.inputBg,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.inputBorder}`,
                backdropFilter: 'blur(8px)',
              }}
              onFocus={e => (e.target.style.borderColor = theme.colors.inputBorderFocus)}
              onBlur={e => (e.target.style.borderColor = theme.colors.inputBorder)}
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-4 py-4 pr-12 rounded-xl outline-none border transition-all text-sm"
              style={{
                background: theme.colors.inputBg,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.inputBorder}`,
                backdropFilter: 'blur(8px)',
              }}
              onFocus={e => (e.target.style.borderColor = theme.colors.inputBorderFocus)}
              onBlur={e => (e.target.style.borderColor = theme.colors.inputBorder)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: theme.colors.textSecondary }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base mt-1 transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
              color: theme.colors.background,
              boxShadow: `0 4px 20px rgba(242,194,48,0.35)`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </motion.button>

          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="w-full py-4 rounded-xl font-semibold text-base border transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: theme.colors.text,
              border: `1px solid rgba(255,255,255,0.15)`,
              backdropFilter: 'blur(8px)',
            }}
          >
            Criar Conta
          </button>
        </form>
      </motion.div>
    </div>
  );
}
