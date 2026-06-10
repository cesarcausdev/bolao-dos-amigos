import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { theme } from './theme';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Home } from './components/Home';
import { BoloesList } from './components/BoloesList';
import { Classificacao } from './components/Classificacao';
import { BolaoDetail } from './components/BolaoDetail';
import { Palpite } from './components/Palpite';
import { PalpitesList } from './components/PalpitesList';
import { Profile } from './components/Profile';
import { CriarBolao } from './components/CriarBolao';
import { BottomNav } from './components/BottomNav';
import { loadAuth, saveAuth, clearAuth } from './lib/auth';
import type { Screen, Bolao, User } from './components/types';

const AUTH_SCREENS: Screen[] = ['login', 'register'];
const screensWithNav: Screen[] = ['home', 'boloes', 'classificacao', 'bolao-detail', 'palpite', 'bolao-ranking', 'palpites-list', 'profile', 'criar-bolao'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [screenData, setScreenData] = useState<unknown>(null);
  const [history, setHistory] = useState<Array<{ screen: Screen; data: unknown }>>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = loadAuth();
    if (auth) {
      setCurrentUser(auth.user);
      setScreen('home');
    }
  }, []);

  const navigate = (newScreen: Screen, data?: unknown) => {
    setHistory(prev => [...prev, { screen, data: screenData }]);
    setScreen(newScreen);
    setScreenData(data ?? null);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setScreen(prev.screen);
      setScreenData(prev.data);
      setHistory(h => h.slice(0, -1));
    }
  };

  const handleLogin = (user: User, token: string) => {
    saveAuth(token, user);
    setCurrentUser(user);
    setHistory([]);
    navigate('home');
  };

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    setHistory([]);
    setScreenData(null);
    setScreen('login');
  };

  const showNav = screensWithNav.includes(screen) && !AUTH_SCREENS.includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <Login onNavigate={navigate} onLogin={handleLogin} />;
      case 'register':
        return <Register onNavigate={navigate} onRegister={handleLogin} />;
      case 'home':
        return <Home onNavigate={navigate} currentUser={currentUser} />;
      case 'boloes':
        return <BoloesList onNavigate={navigate} />;
      case 'classificacao':
        return <Classificacao currentUserId={currentUser?.id} />;
      case 'bolao-detail':
        return <BolaoDetail bolao={screenData as Bolao} onNavigate={navigate} onBack={goBack} currentUserId={currentUser?.id} />;
      case 'palpite':
        return <Palpite bolao={screenData as Bolao} onBack={goBack} onNavigate={navigate} />;
      case 'palpites-list':
        return <PalpitesList />;
      case 'profile':
        return <Profile onLogout={handleLogout} onNavigate={navigate} currentUser={currentUser} />;
      case 'criar-bolao':
        return <CriarBolao onBack={goBack} onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} currentUser={currentUser} />;
    }
  };

  const isAuthScreen = AUTH_SCREENS.includes(screen);
  const bgImage = isAuthScreen ? theme.backgrounds.login : theme.backgrounds.app;
  const overlay = screen === 'login' ? theme.overlays.login
    : screen === 'register' ? theme.overlays.register
    : theme.overlays.app;

  return (
    // Outer shell — fills viewport, centers the 430px column, paints the letterbox
    <div className="flex justify-center min-h-screen" style={{ background: '#000' }}>
      {/* App column — never wider than a phone */}
      <div
        className="relative w-full min-h-screen"
        style={{
          maxWidth: 430,
          backgroundImage: overlay === 'none' ? `url(${bgImage})` : `${overlay}, url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'scroll',
          backgroundColor: theme.colors.background,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* BottomNav wrapper — fixed + re-centered to stay inside the 430px column on desktop */}
        {showNav && (
          <div
            className="fixed bottom-0 left-1/2 z-50 w-full"
            style={{ transform: 'translateX(-50%)', maxWidth: 430 }}
          >
            <BottomNav
              active={screen}
              onNavigate={(s) => {
                setHistory([]);
                setScreenData(null);
                setScreen(s);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
