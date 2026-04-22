import { motion } from 'motion/react';
import { Clock, Calendar } from 'lucide-react';

const SCHEDULE: Record<string, { time: string; subject: string; teacher?: string; room?: string }[]> = {
  Lunes: [
    { time: '17:30 - 19:30', subject: 'Inglés', room: 'Rancagua Plaza Oriente, local 202' },
  ],
  Martes: [
    { time: '17:30 - 19:40', subject: 'Educación Física', room: 'Patricio Mekis' },
  ],
  Miércoles: [
    { time: '18:30 - 19:30', subject: 'Psicología', room: 'Rancagua Plaza Oriente, local 202' },
    { time: '19:40 - 20:40', subject: 'Lenguaje PAES', room: 'Rancagua Plaza Oriente, local 202' },
  ],
  Jueves: [
    { time: '18:40 - 20:50', subject: 'Historia PAES', room: 'Rancagua Plaza Oriente, local 202' },
  ],
  Viernes: [
    { time: '17:30 - 19:30', subject: 'Matemáticas PAES', room: 'Rancagua Plaza Oriente, local 202' },
    { time: '19:40 - 20:50', subject: 'Vida Castrense (de vez en cuando)', room: 'Rancagua Plaza Oriente, local 202' },
  ],
  Sábado: [
    { time: '10:00 - 14:00', subject: 'Historia Naval (semana por medio)', room: 'Rancagua Plaza Oriente, local 202' },
    { time: '10:00 - 12:00', subject: 'Educación Física (semana por medio)', room: 'Patricio Mekis' },
  ],
};

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const SUBJECT_COLORS: Record<string, string> = {
  'Matemáticas PAES': 'border-l-blue-500 bg-blue-500/5',
  'Lenguaje PAES': 'border-l-purple-500 bg-purple-500/5',
  'Historia PAES': 'border-l-amber-500 bg-amber-500/5',
  'Historia Naval (semana por medio)': 'border-l-yellow-500 bg-yellow-500/5',
  'Educación Física': 'border-l-green-500 bg-green-500/5',
  'Educación Física (semana por medio)': 'border-l-green-400 bg-green-400/5',
  'Psicología': 'border-l-pink-500 bg-pink-500/5',
  'Inglés': 'border-l-cyan-500 bg-cyan-500/5',
  'Vida Castrense (de vez en cuando)': 'border-l-red-500 bg-red-500/5',
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || 'border-l-slate-600 bg-slate-600/5';
}

function getCurrentDay() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[new Date().getDay()];
}

export default function ModuleSchedule() {
  const today = getCurrentDay();

  return (
    <div className="min-h-screen bg-vortex-dark py-8 px-4 md:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-10"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-vortex-accent/10 border border-vortex-accent/30 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-vortex-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-white">Horario Semanal</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
              Preuniversitario Los Héroes de Ñuble // Lunes — Sábado
            </p>
          </div>
        </div>
      </motion.div>

      {/* Schedule Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DAYS.map((day, dayIdx) => {
          const isToday = day === today;
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIdx * 0.07 }}
              className={`rounded-xl border overflow-hidden ${
                isToday
                  ? 'border-vortex-accent/50 shadow-[0_0_30px_rgba(204,0,0,0.1)]'
                  : 'border-slate-800'
              } bg-vortex-surface/30`}
            >
              {/* Day Header */}
              <div
                className={`px-5 py-4 flex items-center justify-between ${
                  isToday ? 'bg-vortex-accent/10' : 'bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-serif italic font-bold ${
                      isToday ? 'text-vortex-accent' : 'text-white'
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-vortex-accent/20 text-vortex-accent px-2 py-0.5 rounded-full border border-vortex-accent/30">
                      Hoy
                    </span>
                  )}
                </div>
                <Clock className={`w-4 h-4 ${isToday ? 'text-vortex-accent' : 'text-slate-600'}`} />
              </div>

              {/* Classes */}
              <div className="p-4 space-y-3">
                {SCHEDULE[day].map((cls, clsIdx) => (
                  <div
                    key={clsIdx}
                    className={`border-l-2 pl-3 py-2 pr-3 rounded-r-lg ${getSubjectColor(cls.subject)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-tight">{cls.subject}</p>
                      <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap mt-0.5">{cls.room}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{cls.time}</p>
                    {cls.teacher && (
                      <p className="text-[10px] text-slate-600 mt-0.5 italic">{cls.teacher}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 text-center">
        <p className="text-[10px] text-slate-700 font-mono italic tracking-widest uppercase">
          Los Héroes de Ñuble // Horario sujeto a modificaciones // 2026
        </p>
      </footer>
    </div>
  );
}
