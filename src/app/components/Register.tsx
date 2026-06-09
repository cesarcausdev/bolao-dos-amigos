import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import type { Screen, User } from './types';

interface RegisterProps {
  onNavigate: (screen: Screen) => void;
  onRegister: (user: User, token: string) => void;
}

export function Register({ onNavigate, onRegister }: RegisterProps) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user, token } = await api.auth.register(form.name, form.email, form.password);
      onRegister(user, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
    { key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
    { key: 'password', label: 'Senha', type: 'password', placeholder: '••••••••' },
    { key: 'confirm', label: 'Confirmar senha', type: 'password', placeholder: '••••••••' },
  ] as const;

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
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl outline-none border transition-all"
                style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
                onFocus={e => (e.target.style.borderColor = '#22C55E')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base mt-2 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#0F172A', boxShadow: '0 4px 20px rgba(34,197,94,0.3)', opacity: loading ? 0.7 : 1 }}
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
