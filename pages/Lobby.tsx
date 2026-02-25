import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/Button';
import { GlassPanel } from '../components/GlassPanel';
import { Users, Copy, Play, Ban, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Lobby: React.FC = () => {
  const { room, isHost, startGame, leaveRoom, kickPlayer, banPlayer } = useGame();
  const { t } = useLanguage();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (room?.status === 'playing') {
      navigate('/game');
    }
    if (!room) {
      navigate('/dashboard');
    }
  }, [room, navigate]);

  const handleLeave = async () => {
      await leaveRoom();
      navigate('/dashboard');
  };

  const handleKick = (e: React.MouseEvent, playerId: string) => {
      e.stopPropagation();
      if (confirm(t('kickConfirm'))) {
          kickPlayer(playerId);
      }
  };

  const handleBan = (e: React.MouseEvent, playerId: string) => {
      e.stopPropagation();
      if (confirm(t('banConfirm'))) {
          banPlayer(playerId);
      }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Room Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex flex-col items-center justify-center p-6 rounded-[32px] bg-card/50 border border-white/10 backdrop-blur-xl relative">
            <span className="text-sm text-gray-400 uppercase tracking-widest mb-1">{t('roomCode')}</span>
            <div className="flex items-center gap-3">
              <h1 className="text-6xl font-mono font-bold text-primary tracking-[0.2em]">{room.code}</h1>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => navigator.clipboard.writeText(room.code)}>
                <Copy className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>
          <p className="text-gray-400 animate-pulse">{t('waitingForPlayers')}</p>
        </div>

        {/* Players Grid */}
        <GlassPanel className="min-h-[300px]">
          <div className="flex items-center gap-2 mb-6 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="font-medium">{room.players.length} {t('playersConnected')}</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {room.players.map((player) => (
              <div key={player.id} className="flex flex-col items-center p-4 rounded-xl bg-base border border-white/5 relative overflow-hidden group hover:border-primary/50 transition-colors">
                {player.is_host && (
                    <div className="absolute top-2 right-2 z-10">
                        <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded border border-gold/30">{t('hostTag')}</span>
                    </div>
                )}
                
                {/* Host Controls for other players */}
                {isHost && !player.is_host && (
                    <div className="absolute top-2 right-2 flex gap-1 z-20">
                         <button onClick={(e) => handleKick(e, player.id)} className="p-1.5 bg-card/80 hover:bg-danger text-white rounded-md transition-colors" title={t('kickTitle')}>
                             <LogOut className="w-3 h-3" />
                         </button>
                         <button onClick={(e) => handleBan(e, player.id)} className="p-1.5 bg-card/80 hover:bg-red-900 text-danger rounded-md transition-colors" title={t('banTitle')}>
                             <Ban className="w-3 h-3" />
                         </button>
                    </div>
                )}

                <div className="w-16 h-16 rounded-full bg-gray-800 mb-3 border-2 border-transparent group-hover:border-primary transition-all">
                  <img src={player.avatar_url || `https://picsum.photos/seed/${player.username}/100`} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="font-bold text-sm truncate w-full text-center">{player.username}</span>
                {player.banned && (
                  <span className="text-[10px] text-danger font-bold uppercase mt-1">{t('bannedLabel')}</span>
                )}
                <span className="text-xs text-gray-500">{player.score} {t('pts')}</span>
              </div>
            ))}
            
            {/* Empty slots placeholders */}
            {[1, 2, 3].map((i) => (
               <div key={`empty-${i}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 border-dashed opacity-30">
                  <div className="w-16 h-16 rounded-full bg-white/5 mb-3" />
                  <span className="w-12 h-2 bg-white/5 rounded" />
               </div>
            ))}
          </div>
        </GlassPanel>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={handleLeave}>
            {t('leaveRoom')}
          </Button>
          {isHost && (
            <Button size="lg" className="px-12" onClick={startGame}>
              <Play className="w-5 h-5" />
              {t('startGame')}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Lobby;
