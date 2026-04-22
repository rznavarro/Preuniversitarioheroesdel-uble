import { motion } from 'motion/react';
import { ImageIcon, Camera } from 'lucide-react';

export default function ModuleMemories() {
  return (
    <div className="min-h-screen bg-vortex-dark flex flex-col items-center justify-center gap-8 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Polaroid animated icon */}
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 shadow-[0_0_60px_rgba(255,255,255,0.05)]"
        >
          <Camera className="w-10 h-10 text-white/40" />
          <div className="w-16 h-2 bg-white/10 rounded-full" />
        </motion.div>

        <div>
          <h2 className="text-3xl font-serif italic text-white mb-2">Recuerdos</h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Módulo en preparación
          </p>
        </div>

        <div className="vortex-card px-8 py-6 max-w-sm border-slate-800">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-vortex-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-400 leading-relaxed text-left">
              Aquí se mostrarán los recuerdos y fotos del grupo. En cuanto me proporciones 
              las imágenes, configuraré una galería completa con álbumes y visualización.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-slate-700 font-mono italic tracking-widest uppercase">
          Los Héroes de Ñuble // Awaiting image files
        </p>
      </motion.div>
    </div>
  );
}
