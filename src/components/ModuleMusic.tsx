import { motion } from 'motion/react';
import { Music2, Disc3 } from 'lucide-react';

export default function ModuleMusic() {
  return (
    <div className="min-h-screen bg-vortex-dark flex flex-col items-center justify-center gap-8 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="flex flex-col items-center gap-6 text-center"
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
            Módulo en preparación
          </p>
        </div>

        <div className="vortex-card px-8 py-6 max-w-sm border-slate-800">
          <div className="flex items-start gap-3">
            <Music2 className="w-5 h-5 text-vortex-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-400 leading-relaxed text-left">
              Pronto podrás reproducir tu playlist aquí. En cuanto me proporciones las canciones, 
              configuraré el reproductor completo con álbumes, artistas y controles de reproducción.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-slate-700 font-mono italic tracking-widest uppercase">
          Los Héroes de Ñuble // Awaiting audio files
        </p>
      </motion.div>
    </div>
  );
}
