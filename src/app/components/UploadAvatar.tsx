import { useRef, useState } from 'react';
import { Camera, ImageIcon, SkipForward } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { theme } from '../theme';
import type { User } from './types';

interface UploadAvatarProps {
  currentUser: User | null;
  onDone: (updatedUser?: User) => void;
}

export function UploadAvatar({ currentUser, onDone }: UploadAvatarProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    try {
      const updatedUser = await api.profile.uploadAvatar(selectedFile);
      onDone(updatedUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar foto.');
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = preview || currentUser?.avatar;

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm mx-auto flex flex-col items-center"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black" style={{ color: theme.colors.text }}>
            Foto de perfil
          </h1>
          <p className="text-sm mt-2" style={{ color: theme.colors.textSecondary }}>
            Adicione uma foto para que seus amigos te reconheçam
          </p>
        </div>

        {/* Avatar circle */}
        <motion.div
          animate={preview ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="relative mb-8"
        >
          <div
            className="w-36 h-36 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              border: `3px solid ${preview ? theme.colors.primary : theme.colors.border}`,
              background: theme.colors.inputBg,
              transition: 'border-color 0.3s',
            }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-40">
                <Camera size={36} style={{ color: theme.colors.textSecondary }} />
              </div>
            )}
          </div>

          {preview && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
              }}
            >
              <Camera size={14} style={{ color: theme.colors.background }} />
            </motion.div>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <div
            className="w-full mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: theme.colors.dangerBg,
              color: theme.colors.danger,
              border: `1px solid ${theme.colors.dangerBorder}`,
            }}
          >
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="w-full flex gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => cameraRef.current?.click()}
            disabled={loading}
            className="flex-1 py-4 rounded-xl font-semibold text-sm flex flex-col items-center gap-2 transition-all"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.cardBorder}`,
              color: theme.colors.text,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Camera size={22} style={{ color: theme.colors.primary }} />
            Tirar foto
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => galleryRef.current?.click()}
            disabled={loading}
            className="flex-1 py-4 rounded-xl font-semibold text-sm flex flex-col items-center gap-2 transition-all"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.cardBorder}`,
              color: theme.colors.text,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <ImageIcon size={22} style={{ color: theme.colors.primary }} />
            Da galeria
          </motion.button>
        </div>

        {/* Confirm upload button — only shown when a file is selected */}
        {preview && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base mb-4 transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
              color: theme.colors.background,
              boxShadow: `0 4px 20px rgba(242,194,48,0.3)`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Salvando…' : 'Usar esta foto'}
          </motion.button>
        )}

        {/* Skip */}
        <button
          onClick={() => onDone()}
          disabled={loading}
          className="flex items-center gap-2 py-3 text-sm font-medium transition-all"
          style={{ color: theme.colors.textSecondary, opacity: loading ? 0.4 : 1 }}
        >
          <SkipForward size={16} />
          Pular essa etapa
        </button>

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
      </motion.div>
    </div>
  );
}
