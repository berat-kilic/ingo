import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export const ConnectionStatus: React.FC = () => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(true); // Optimistic initial state
  const [showReconnectPopup, setShowReconnectPopup] = useState(false);
  const [reloadCheckTick, setReloadCheckTick] = useState(0);
  const prevConnectedRef = useRef(true);
  const reloadTriggeredRef = useRef(false);
  const hasConfirmedConnectionRef = useRef(false);
  const location = useLocation();
  const isGameArena = location.pathname === '/game';

  const isProfileSettingsFileBusy = () => {
    try {
      return sessionStorage.getItem('ingo_profile_settings_file_busy') === '1';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // 1. Force a subscription to keep the socket alive (Supabase v2 lazy connects)
    const pingChannel = supabase.channel('_ping_keepalive');
    pingChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        hasConfirmedConnectionRef.current = true;
        setIsConnected(true);
      }
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setIsConnected(false);
    });

    // 2. Periodic Socket State Check
    const checkConnection = () => {
      const rawState = supabase.realtime.connectionState;
      const state = typeof rawState === 'string' ? rawState : '';
      const normalizedState = state.toLowerCase();

      if (normalizedState === 'open' || normalizedState === 'connecting') {
        setIsConnected(true);
      } else {
        if (normalizedState === 'closed' || normalizedState === 'disconnected') {
          setIsConnected(false);
          supabase.realtime.connect();
        }
      }
    };

    const intervalId = setInterval(checkConnection, 2000);

    // 3. Event Listeners for Tab Switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const state = supabase.realtime.connectionState;
        if (state !== 'OPEN') {
          setIsConnected(false);
          supabase.realtime.connect();
        } else {
          checkConnection();
        }
      }
    };

    const handleOnline = () => {
      supabase.realtime.connect();
      checkConnection();
    };

    const handleOffline = () => setIsConnected(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial trigger
    checkConnection();
    supabase.realtime.connect();

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(pingChannel);
    };
  }, []);

  useEffect(() => {
    const handleDraftReady = () => setReloadCheckTick((v) => v + 1);
    window.addEventListener('ingo:profile-settings-file-ready', handleDraftReady);
    return () => window.removeEventListener('ingo:profile-settings-file-ready', handleDraftReady);
  }, []);

  useEffect(() => {
    if (!isGameArena || isConnected) {
      setShowReconnectPopup(false);
    }

    if (isConnected) {
      reloadTriggeredRef.current = false;
    }

    // Show popup only when connection drops during game.
    if (isGameArena && !isConnected && prevConnectedRef.current) {
      setShowReconnectPopup(true);
    }

    // Outside game/profile-edit/settings: if page is open while disconnected, hard reload.
    // This also covers returning from an exempt page while already disconnected.
    if (
      !isGameArena &&
      location.pathname !== '/settings' &&
      !(location.pathname === '/profile-settings' && isProfileSettingsFileBusy()) &&
      !isConnected &&
      hasConfirmedConnectionRef.current
    ) {
      if (!reloadTriggeredRef.current) {
        reloadTriggeredRef.current = true;
        window.location.reload();
      }
    }

    prevConnectedRef.current = isConnected;
  }, [isConnected, isGameArena, location.pathname, reloadCheckTick]);

  const reconnectNow = () => {
    setShowReconnectPopup(false);
    supabase.realtime.connect();
  };

  return (
    <>
      {showReconnectPopup && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-card p-5">
            <h3 className="text-lg font-bold mb-2">{t('connectionLost')}</h3>
            <p className="text-sm text-gray-300 mb-4">{t('reconnectPrompt')}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                onClick={() => setShowReconnectPopup(false)}
              >
                {t('close')}
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-semibold"
                onClick={reconnectNow}
              >
                {t('reconnect')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`
            fixed z-[9999] flex items-center gap-2 pointer-events-none transition-all duration-500
            ${isGameArena ? 'bottom-24 left-6' : 'bottom-4 left-4'}
        `}
      >
        <div
          className={`
                w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/10
                transition-all duration-500
                ${isConnected ? 'bg-success shadow-success/50 animate-pulse' : 'bg-danger shadow-danger/50'}
            `}
        />
        <span
          className={`
                                text-[10px] font-bold px-2 py-1 rounded bg-black/60 backdrop-blur-md transition-all duration-300
                                ${isConnected ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'}
                                text-danger
                        `}
        >
          {t('noConnection')}
        </span>
      </div>
    </>
  );
};
