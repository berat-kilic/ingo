import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { Button } from '../components/Button';
import { GlassPanel } from '../components/GlassPanel';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Globe, Trash2, Music } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { soundEffectsEnabled, musicEnabled, setSoundEffectsEnabled, setMusicEnabled } = useAudio();
  const navigate = useNavigate();

  const handleDelete = async () => {
      if (confirm(t('deleteWarning'))) {
          try {
              await deleteAccount();
              navigate('/');
          } catch (e) {
              alert(t('deleteFailed'));
          }
      }
  };

  if (!user) return null;

  const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-primary' : 'bg-gray-600'}`}
      aria-pressed={enabled}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${enabled ? 'right-1' : 'left-1'}`}
      />
    </button>
  );

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="pl-0">
             <ArrowLeft className="w-5 h-5 mr-2" /> {t('back')}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="mb-4">
            <h1 className="text-3xl font-display font-bold">{t('settings')}</h1>
            <p className="text-gray-400">{t('settingsDesc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Preferences */}
            <GlassPanel>
                <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-wider">{t('preferences')}</h3>
                <div className="space-y-4">
                    {/* Sound Effects */}
                    <div className="flex items-center justify-between p-3 bg-base/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-gray-400" />
                            <span>{t('soundEffects')}</span>
                        </div>
                        <Toggle enabled={soundEffectsEnabled} onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)} />
                    </div>

                    {/* Music */}
                    <div className="flex items-center justify-between p-3 bg-base/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Music className="w-5 h-5 text-gray-400" />
                            <span>{t('music')}</span>
                        </div>
                        <Toggle enabled={musicEnabled} onClick={() => setMusicEnabled(!musicEnabled)} />
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between p-3 bg-base/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <span>{t('language')}</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLanguage('tr')}
                                className={`p-1 rounded border-2 transition-all ${language === 'tr' ? 'border-primary bg-primary/10' : 'border-transparent opacity-50'}`}
                                aria-label="Turkce"
                            >
                                <img src="/TR.png" alt="TR" className="h-9 w-auto object-contain" />
                            </button>
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`p-1 rounded border-2 transition-all ${language === 'en' ? 'border-primary bg-primary/10' : 'border-transparent opacity-50'}`}
                                aria-label="English"
                            >
                                <img src="/EN.png" alt="EN" className="h-9 w-auto object-contain" />
                            </button>
                        </div>
                    </div>

                    <div className="px-1 pt-1 text-xs text-gray-400 whitespace-pre-line">
                        {"Code: Berat Kılıç\nDesign: Samet Kılıç"}
                    </div>
                </div>
            </GlassPanel>

            {/* Danger Zone */}
            <GlassPanel className="border-danger/20">
                <h3 className="font-bold mb-4 text-danger uppercase text-xs tracking-wider">{t('dangerZone')}</h3>
                <p className="text-sm text-gray-400 mb-4">{t('deleteWarning')}</p>
                <Button variant="danger" fullWidth className="justify-center" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" /> {t('deleteAccount')}
                </Button>
            </GlassPanel>
        </div>
      </div>
    </div>
  );
};

export default Settings;
