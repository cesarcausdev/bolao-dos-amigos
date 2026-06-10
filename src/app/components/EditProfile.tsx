import { useRef, useState } from 'react';
import { ArrowLeft, Camera, ImageIcon, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { User } from './types';

interface EditProfileProps {
  currentUser: User | null;
  onBack: () => void;
  onSaved: (updatedUser: User) => void;
}

const inputStyle = {
  background: theme.colors.inputBg,
  color: theme.colors.text,
  border: `1px solid ${theme.colors.inputBorder}`,
  backdropFilter: 'blur(8px)',
  fontSize: 15,
} as const;

function PasswordInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  const [visible, setVisible] = useState(false);
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = theme.colors.inputBorderFocus);
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = theme.colors.inputBorder);

  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 rounded-xl outline-none border transition-all"
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          style={{ color: theme.colors.textSecondary }}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export function EditProfile({ currentUser, onBack, onSaved }: EditProfileProps) {
  const [name, setName] = useState(currentUser?.name ?? '');
  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setShowAvatarOptions(false);
    e.target.value = '';
  };

  const hasChanges =
    name !== (currentUser?.name ?? '') ||
    username !== (currentUser?.username ?? '') ||
    avatarFile !== null ||
    newPassword !== '';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      let updatedUser: User | null = null;

      if (avatarFile) {
        updatedUser = await api.profile.uploadAvatar(avatarFile);
      }

      const payload: {
        name?: string;
        username?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};

      if (name.trim() && name.trim() !== currentUser?.name) payload.name = name.trim();
      if (username.trim() && username.trim() !== currentUser?.username) payload.username = username.trim();
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length > 0) {
        updatedUser = await api.profile.update(payload);
      }

      if (updatedUser) {
        onSaved(updatedUser);
      } else {
        onBack();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = avatarPreview ?? currentUser?.avatar;

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = theme.colors.inputBorderFocus);
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = theme.colors.inputBorder);

  return (
    <div className="min-h-screen flex flex-col pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button onClick={onBack} style={{ color: theme.colors.textSecondary }}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-black" style={{ color: theme.colors.text }}>
          Editar perfil
        </h1>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5 px-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="relative">
            <div
              className="w-28 h-28 rounded-full overflow-hidden"
              style={{
                border: `3px solid ${avatarPreview ? theme.colors.primary : theme.colors.border}`,
                background: theme.colors.inputBg,
                transition: 'border-color 0.3s',
              }}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <Camera size={32} style={{ color: theme.colors.textSecondary }} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAvatarOptions(true)}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
              }}
            >
              <Camera size={16} style={{ color: theme.colors.background }} />
            </button>
          </div>

          {avatarPreview && (
            <p className="text-xs" style={{ color: theme.colors.primary }}>
              Nova foto pronta para salvar
            </p>
          )}
        </div>

        {/* Error / success */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: theme.colors.dangerBg,
              color: theme.colors.danger,
              border: `1px solid ${theme.colors.dangerBorder}`,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(0, 210, 106, 0.1)',
              color: theme.colors.success,
              border: '1px solid rgba(0, 210, 106, 0.2)',
            }}
          >
            {success}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
            Nome
          </label>
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
          <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
            Username
          </label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
              style={{ color: theme.colors.primaryDark }}
            >
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={e =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
              }
              placeholder="username"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full pl-8 pr-4 py-3 rounded-xl outline-none border transition-all"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: '#4B6B55' }}>
            Letras, números e _ apenas.
          </p>
        </div>

        {/* Password section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: theme.colors.border }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
              Alterar senha
            </span>
            <div className="flex-1 h-px" style={{ background: theme.colors.border }} />
          </div>
          <p className="text-xs mb-4" style={{ color: theme.colors.textSecondary }}>
            Deixe em branco para manter a senha atual.
          </p>

          <div className="flex flex-col gap-4">
            <PasswordInput
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="••••••••"
            />
            <PasswordInput
              label="Nova senha"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="••••••••"
            />
            <PasswordInput
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading || !hasChanges}
          className="w-full py-4 rounded-xl font-bold text-base mt-2 transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
            color: theme.colors.background,
            boxShadow: `0 4px 20px rgba(242,194,48,0.3)`,
            opacity: loading || !hasChanges ? 0.5 : 1,
          }}
        >
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </motion.button>
      </form>

      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar options — bottom sheet */}
      <AnimatePresence>
        {showAvatarOptions && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAvatarOptions(false)}
              className="fixed inset-0 z-[55]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
            <div className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center">
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="w-full rounded-t-3xl px-5 pt-4 pb-28"
              style={{ maxWidth: 430, background: theme.colors.secondary, border: `1px solid ${theme.colors.cardBorder}` }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: theme.colors.border }} />
              <p className="text-base font-black mb-4" style={{ color: theme.colors.text }}>Foto de perfil</p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => { cameraRef.current?.click(); setShowAvatarOptions(false); }}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl w-full text-left"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(242,194,48,0.12)' }}>
                    <Camera size={20} style={{ color: theme.colors.primary }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>Tirar foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => { galleryRef.current?.click(); setShowAvatarOptions(false); }}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl w-full text-left"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.cardBorder}` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(242,194,48,0.12)' }}>
                    <ImageIcon size={20} style={{ color: theme.colors.primary }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>Da galeria</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarOptions(false)}
                className="w-full py-4 mt-2 text-sm font-medium"
                style={{ color: theme.colors.textSecondary }}
              >
                Cancelar
              </button>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
