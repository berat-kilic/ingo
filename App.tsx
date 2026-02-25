import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AudioProvider } from './context/AudioContext';
import { ConnectionStatus } from './components/ConnectionStatus';
import Background from './components/Background';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Lobby from './pages/Lobby';
import GameArena from './pages/GameArena';
import Profile from './pages/Profile';
import ProfileSettings from './pages/ProfileSettings';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) return <div className="min-h-screen bg-base flex items-center justify-center">{t('loading')}</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

const AppRoutes = () => {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
            <Route path="/game" element={<ProtectedRoute><GameArena /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <Router>
        <LanguageProvider>
            <AuthProvider>
                <AudioProvider>
                    <GameProvider>
                        <Background />
                        <ConnectionStatus />
                        <AppRoutes />
                    </GameProvider>
                </AudioProvider>
            </AuthProvider>
        </LanguageProvider>
    </Router>
  );
};

export default App;
