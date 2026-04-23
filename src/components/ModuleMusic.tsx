import { motion } from 'motion/react';
import { Disc3, Pause, Play } from 'lucide-react';

interface ModuleMusicProps {
  isPlaying: boolean;
  songs: { title: string }[];
  currentSongIndex: number;
  onTogglePlayback: () => void;
  onSelectSong: (index: number) => void;
}

export default function ModuleMusic({ isPlaying, songs, currentSongIndex, onTogglePlayback, onSelectSong }: ModuleMusicProps) {
  return (
    <div className="min-h-screen bg-vortex-dark flex flex-col items-center justify-center gap-8 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="flex flex-col items-center gap-6 text-center w-full max-w-3xl"
      >
        {/* Animated disc */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-vortex-accent via-red-900 to-slate-900 flex items-center justify-center border border-vortex-accent/30 shadow-[0_0_60px_rgba(204,0,0,0.2)]"
        >
          <Disc3 className="w-14 h-14 text-white/80" />
        </motion.div>

        <div>
          <h2 className="text-3xl font-serif italic text-white mb-2">Música</h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Modo audio
          </p>
        </div>

        <div className="vortex-card px-8 py-8 w-full max-w-md border-slate-800">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Reproductor del preu</p>
              <p className="text-[11px] text-slate-500">Sin video visible, solo audio</p>
              <p className="text-[11px] text-vortex-accent mt-1">{songs[currentSongIndex]?.title}</p>
            </div>
            <Disc3 className={`w-6 h-6 ${isPlaying ? 'text-vortex-accent animate-spin' : 'text-slate-500'}`} />
          </div>

          <button
            onClick={onTogglePlayback}
            className="w-full h-12 rounded-xl bg-vortex-accent hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-white font-semibold"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </button>

          <div className="mt-4 space-y-2">
            {songs.map((song, idx) => (
              <button
                key={song.title}
                onClick={() => onSelectSong(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm ${
                  idx === currentSongIndex
                    ? 'border-vortex-accent/50 bg-vortex-accent/10 text-white'
                    : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {song.title}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-slate-600 font-mono uppercase tracking-wider">
            Audio listo
          </p>
        </div>

        <p className="text-[10px] text-slate-700 font-mono italic tracking-widest uppercase">
          Los Héroes de Ñuble // Estilo Spotify
        </p>
      </motion.div>
    </div>
  );
}
