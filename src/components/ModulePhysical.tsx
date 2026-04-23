import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Timer, 
  History,
  Trash2,
  Save,
  Dumbbell
} from 'lucide-react';

import { UserProfile, PhysicalRecord } from '../types';

interface ModulePhysicalProps {
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const institutionMap: Record<string, string> = {
  'NAVY': 'Armada / Escuela Naval',
  'AIR_FORCE': 'Fuerza Aérea / FACh',
  'ARMY': 'Ejército / Escuela Militar',
  'PDI': 'Investigaciones / PDI',
  'CARABINEROS': 'Carabineros de Chile',
  'GOPE': 'Fuerzas Especiales / GOPE',
  'SPECIALTIES': 'Especialidades / Técnica'
};

export default function ModulePhysical({ profile, updateProfile }: ModulePhysicalProps) {
  const [manualEntry, setManualEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    minutes: '',
    seconds: '',
    distance: '2400m' as '2400m' | '3000m'
  });

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry.minutes || !manualEntry.seconds) return;

    const formattedMinutes = manualEntry.minutes.padStart(2, '0');
    const formattedSeconds = manualEntry.seconds.padStart(2, '0');
    const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

    const newRecord: PhysicalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(manualEntry.date + 'T12:00:00').toLocaleDateString('es-CL'),
      time: formattedTime,
      type: manualEntry.distance
    };

    updateProfile({
      performanceHistory: [newRecord, ...profile.performanceHistory]
    });

    setManualEntry({
      ...manualEntry,
      minutes: '',
      seconds: ''
    });
  };

  const handleDeleteRecord = (id: string) => {
    updateProfile({
      performanceHistory: profile.performanceHistory.filter(r => r.id !== id)
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 relative">
      {/* Background Page Identifier */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none -z-10 rotate-12">
        <Dumbbell className="w-64 h-64" />
      </div>

      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-bold text-vortex-accent uppercase tracking-[0.3em] mb-2">Ingreso de Marcas</h2>
          <h1 className="text-4xl font-serif text-white italic">Rendimiento Físico</h1>
        </div>
        <div className="hidden sm:flex gap-2">
          <div className="text-right p-3 border-r border-slate-800">
            <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1">Malla</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase">Castrense 1.0</p>
          </div>
          <div className="text-right p-3">
            <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1">Status</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase">Operativo</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manual Entry Card */}
        <div className="lg:col-span-2 vortex-card p-12 bg-vortex-surface/30 border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Save className="w-64 h-64" />
          </div>
          
          <h3 className="text-lg font-serif italic text-white mb-8 relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-vortex-accent/10 border border-vortex-accent/30 flex items-center justify-center">
              <Play className="w-4 h-4 text-vortex-accent" />
            </div>
            Registrar Prueba de Suficiencia
          </h3>

          <form onSubmit={handleManualSave} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Fecha de Ejecución</label>
                <input 
                  type="date" 
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded px-4 py-3 text-white focus:outline-none focus:border-vortex-accent/50 transition-colors cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Distancia Recorrida</label>
                <div className="flex gap-2 h-[46px]">
                  <button 
                    type="button"
                    onClick={() => setManualEntry({...manualEntry, distance: '2400m'})}
                    className={`flex-1 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${manualEntry.distance === '2400m' ? 'bg-vortex-accent border-vortex-accent text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'}`}
                  >
                    2.400 Metros
                  </button>
                  <button 
                    type="button"
                    onClick={() => setManualEntry({...manualEntry, distance: '3000m'})}
                    className={`flex-1 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${manualEntry.distance === '3000m' ? 'bg-vortex-accent border-vortex-accent text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'}`}
                  >
                    3.000 Metros
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tiempo Obtenido (MIN : SEG)</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="number" 
                    placeholder="00"
                    min="0"
                    max="59"
                    value={manualEntry.minutes}
                    onChange={(e) => setManualEntry({...manualEntry, minutes: e.target.value})}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-6 py-8 text-6xl font-serif italic text-white text-center focus:outline-none focus:border-vortex-accent transition-all placeholder:text-slate-800"
                  />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Minutos</span>
                </div>
                <div className="text-6xl text-slate-800 font-serif">:</div>
                <div className="flex-1 relative">
                  <input 
                    type="number" 
                    placeholder="00"
                    min="0"
                    max="59"
                    value={manualEntry.seconds}
                    onChange={(e) => setManualEntry({...manualEntry, seconds: e.target.value})}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-6 py-8 text-6xl font-serif italic text-white text-center focus:outline-none focus:border-vortex-accent transition-all placeholder:text-slate-800"
                  />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Segundos</span>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!manualEntry.minutes || !manualEntry.seconds}
              className="w-full h-16 flex items-center justify-center gap-3 bg-vortex-accent hover:bg-vortex-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg text-white font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(204,0,0,0.2)]"
            >
              <Save className="w-5 h-5" />
              Guardar Marca en Registro Naval
            </button>
          </form>
        </div>

        {/* Scoring & Info */}
        <div className="flex flex-col gap-6">
          <div className="vortex-card p-8 flex-1 border-slate-800/50 bg-[#0a0e14]/20">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8 border-b border-slate-800 pb-4 h-12 flex items-center">
              <History className="w-3 h-3 mr-3 text-vortex-accent/50" />
              Últimas Marcas
            </h3>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {profile.performanceHistory.map((record, i) => (
                  <motion.div 
                    key={record.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-vortex-accent/10 font-serif italic text-2xl group-hover:text-vortex-accent/20 transition-colors">{i + 1}</div>
                      <div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-none mb-1.5">{record.date} • {record.type}</p>
                        <p className="text-xl font-serif italic text-white tracking-widest">{record.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-slate-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {profile.performanceHistory.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-700 font-serif italic text-sm">Sin registros previos. Registra una marca en la pista.</p>
                </div>
              )}
            </div>
          </div>

          <div className="vortex-card p-8 border-vortex-accent/10 bg-vortex-accent/5">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-vortex-accent shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              Referencia de Usuario
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed mb-8 italic">
              Institución destino: <span className="text-slate-100">{institutionMap[profile.targetInstitution]}</span>. Registra tu marca real y mejora progresivamente.
            </p>
            <div className="flex items-end justify-between border-t border-slate-800/50 pt-6">
              <div className="text-left">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Registro Libre</p>
                <p className="text-2xl font-serif italic text-white">Sin límite fijo</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-vortex-accent uppercase tracking-widest mb-2 underline underline-offset-4 decoration-vortex-accent/30">Mejora Continua</p>
                <p className="text-2xl font-serif italic text-vortex-accent">Siempre se puede mejorar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
