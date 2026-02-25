import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type EffectName = 'click' | 'correct' | 'wrong' | 'time' | 'win';

interface AudioContextType {
  soundEffectsEnabled: boolean;
  musicEnabled: boolean;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  playEffect: (name: EffectName, options?: { loop?: boolean; restart?: boolean }) => void;
  stopEffect: (name: EffectName) => void;
}

const SOUND_EFFECTS_KEY = 'ingo_sound_effects_enabled';
const MUSIC_KEY = 'ingo_music_enabled';
const MUSIC_TRACKS = ['m1', 'm2', 'm3', 'm4'];

const effectSourceMap: Record<EffectName, string[]> = {
  click: ['/audio/click.ogg', '/audio/click.mp3'],
  correct: ['/audio/duo.correct.ogg', '/audio/duo.correct.mp3'],
  wrong: ['/audio/duo.wrong.ogg', '/audio/duo.wrong.mp3'],
  time: ['/audio/time1.ogg', '/audio/time1.mp3'],
  win: ['/audio/win.ogg', '/audio/win.mp3'],
};

const effectVolumeMap: Record<EffectName, number> = {
  click: 0.35,
  correct: 0.65,
  wrong: 0.65,
  time: 0.4,
  win: 0.8,
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const readStoredBoolean = (key: string, fallback: boolean) => {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
};

const shuffle = <T,>(list: T[]): T[] => {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEffectsEnabled, setSoundEffectsEnabledState] = useState<boolean>(() => readStoredBoolean(SOUND_EFFECTS_KEY, true));
  const [musicEnabled, setMusicEnabledState] = useState<boolean>(() => readStoredBoolean(MUSIC_KEY, true));

  const musicEnabledRef = useRef(musicEnabled);
  musicEnabledRef.current = musicEnabled;

  useEffect(() => {
    // Tarayıcıların otomatik oynatma politikaları nedeniyle, sesin başlayabilmesi için
    // kullanıcının sayfayla etkileşime girmesi gerekir. Bu fonksiyon, ilk etkileşimde
    // müzik ayarı açıksa müziği başlatır.
    const startMusicOnInteraction = () => {
      if (musicEnabledRef.current) {
        // Müziği çalan useEffect'i yeniden tetiklemek için
        // musicEnabled state'ini kısaca değiştiriyoruz.
        setMusicEnabledState(false);
        setTimeout(() => setMusicEnabledState(true), 10);
      }
      // Listener'ları ilk etkileşimden sonra kaldırıyoruz ki tekrar çalışmasın.
      window.removeEventListener('click', startMusicOnInteraction);
      window.removeEventListener('keydown', startMusicOnInteraction);
    };

    window.addEventListener('click', startMusicOnInteraction);
    window.addEventListener('keydown', startMusicOnInteraction);

    return () => {
      window.removeEventListener('click', startMusicOnInteraction);
      window.removeEventListener('keydown', startMusicOnInteraction);
    };
  }, []); // Bu effect'in sadece uygulama ilk yüklendiğinde bir kez çalışmasını istiyoruz.

  const effectRefs = useRef<Record<EffectName, HTMLAudioElement | null>>({
    click: null,
    correct: null,
    wrong: null,
    time: null,
    win: null,
  });
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicQueueRef = useRef<string[]>([]);
  const musicStartingRef = useRef(false);

  const getAudio = useCallback((name: EffectName) => {
    if (!effectRefs.current[name]) {
      const probe = document.createElement('audio');
      const supportsOgg = probe.canPlayType('audio/ogg') !== '';
      const source = supportsOgg ? effectSourceMap[name][0] : effectSourceMap[name][1];
      const audio = new Audio(source);
      audio.preload = 'auto';
      audio.volume = effectVolumeMap[name];
      effectRefs.current[name] = audio;
    }
    return effectRefs.current[name]!;
  }, []);

  const playEffect = useCallback(
    (name: EffectName, options?: { loop?: boolean; restart?: boolean }) => {
      if (!soundEffectsEnabled) return;
      const audio = getAudio(name);
      if (options?.restart) {
        audio.currentTime = 0;
      }
      audio.loop = !!options?.loop;
      audio.play().catch(() => {});
    },
    [getAudio, soundEffectsEnabled]
  );

  const stopEffect = useCallback(
    (name: EffectName) => {
      const audio = getAudio(name);
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    },
    [getAudio]
  );

  const stopAllEffects = useCallback(() => {
    (Object.keys(effectRefs.current) as EffectName[]).forEach((name) => {
      const audio = effectRefs.current[name];
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    });
  }, []);

  const stopMusic = useCallback(() => {
    const audio = musicRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const pickNextTrack = useCallback(() => {
    if (musicQueueRef.current.length === 0) {
      musicQueueRef.current = shuffle(MUSIC_TRACKS);
    }
    return musicQueueRef.current.shift() || null;
  }, []);

  const playNextMusicTrack = useCallback(async () => {
    if (!musicEnabled || musicStartingRef.current) return;
    const audio = musicRef.current;
    if (!audio) return;

    musicStartingRef.current = true;
    const track = pickNextTrack();
    if (!track) {
      musicStartingRef.current = false;
      return;
    }

    const supportsOgg = audio.canPlayType('audio/ogg') !== '';
    const src = supportsOgg ? `/audio/musics/${track}.ogg` : `/audio/musics/${track}.mp3`;
    audio.src = src;
    try {
      await audio.play();
    } catch (_) {
      // Browser autoplay policies may block until next interaction.
    } finally {
      musicStartingRef.current = false;
    }
  }, [musicEnabled, pickNextTrack]);

  useEffect(() => {
    localStorage.setItem(SOUND_EFFECTS_KEY, String(soundEffectsEnabled));
    if (!soundEffectsEnabled) {
      stopAllEffects();
    }
  }, [soundEffectsEnabled, stopAllEffects]);

  useEffect(() => {
    localStorage.setItem(MUSIC_KEY, String(musicEnabled));
    if (!musicEnabled) {
      stopMusic();
      return;
    }
    playNextMusicTrack();
  }, [musicEnabled, playNextMusicTrack, stopMusic]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.35;
    audio.onended = () => {
      if (musicEnabled) {
        playNextMusicTrack();
      }
    };
    musicRef.current = audio;

    if (musicEnabled) {
      playNextMusicTrack();
    }

    return () => {
      audio.pause();
      audio.src = '';
      musicRef.current = null;
    };
  }, [musicEnabled, playNextMusicTrack]);

  useEffect(() => {
    const onMouseDown = () => {
      playEffect('click', { restart: true });
    };
    const onKeyDown = () => {
      playEffect('click', { restart: true });
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [playEffect]);

  const setSoundEffectsEnabled = useCallback((enabled: boolean) => {
    setSoundEffectsEnabledState(enabled);
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    setMusicEnabledState(enabled);
  }, []);

  const value = useMemo<AudioContextType>(
    () => ({
      soundEffectsEnabled,
      musicEnabled,
      setSoundEffectsEnabled,
      setMusicEnabled,
      playEffect,
      stopEffect,
    }),
    [musicEnabled, playEffect, setMusicEnabled, setSoundEffectsEnabled, soundEffectsEnabled, stopEffect]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
